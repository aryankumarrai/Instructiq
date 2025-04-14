from flask import Flask, redirect, url_for, session, request, render_template
from flask_session import Session
import google.auth.transport.requests
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.cloud import secretmanager
import os, pathlib, io, hashlib, json, logging
from PyPDF2 import PdfReader
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import google.auth

# Configure logging
logging.basicConfig(level=logging.INFO)

# Set NLTK data path
nltk.data.path.append(os.path.join(os.path.dirname(__file__), "nltk_data"))

app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "/tmp"
Session(app)

GOOGLE_CLIENT_ID = "578770657425-2a64238gmdmknumra9v8kdeveg55mss3.apps.googleusercontent.com"

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly"
]

def get_secret(secret_id):
    try:
        # Explicitly load credentials if available, else rely on App Engine's default
        credentials, project = google.auth.default(scopes=['https://www.googleapis.com/auth/cloud-platform'])
        client = secretmanager.SecretManagerServiceClient(credentials=credentials)
        name = f"projects/instructiq-456811/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(name=name)
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logging.error(f"Failed to retrieve secret {secret_id}: {e}")
        raise

try:
    app.secret_key = get_secret("flask-secret-key")
    client_secrets = json.loads(get_secret("client-secret"))
except Exception as e:
    logging.error(f"Startup failed: {e}")
    raise

redirect_uri = os.getenv("REDIRECT_URI", "http://localhost:5000/callback")
flow = Flow.from_client_config(
    client_config=client_secrets,
    scopes=SCOPES,
    redirect_uri=redirect_uri
)

@app.route("/")
def index():
    if "credentials" in session:
        user_data = {
            "name": session["name"],
            "email": session["email"],
            "imageUrl": session["picture"]
        }
        return render_template("dashboard.html", user=user_data)
    return redirect("/login")

@app.route("/login")
def login():
    try:
        authorization_url, state = flow.authorization_url(prompt="consent", access_type="offline", include_granted_scopes="true")
        session["state"] = state
        return redirect(authorization_url)
    except Exception as e:
        logging.error(f"Error in login route: {e}")
        return render_template("error.html", message="Failed to initiate login")

@app.route("/callback")
def callback():
    try:
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        oauth2_service = build("oauth2", "v2", credentials=credentials)
        user_info = oauth2_service.userinfo().get().execute()

        session["credentials"] = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes
        }
        session["name"] = user_info["name"]
        session["email"] = user_info["email"]
        session["picture"] = user_info["picture"]
        return redirect("/")
    except Exception as e:
        logging.error(f"Error in callback route: {e}")
        return render_template("error.html", message="Authentication failed")

@app.route("/signout")
def signout():
    session.clear()
    return redirect("/")

@app.route("/courses")
def courses():
    if "credentials" not in session:
        return redirect(url_for("login"))
    try:
        creds = Credentials(**session["credentials"])
        classroom = build("classroom", "v1", credentials=creds)
        courses = classroom.courses().list().execute().get("courses", [])
        return render_template("courses.html", courses=courses)
    except Exception as e:
        logging.error(f"Error in courses route: {e}")
        return render_template("error.html", message="Failed to load courses")

@app.route("/assignments/<course_id>")
def assignments(course_id):
    if "credentials" not in session:
        return redirect(url_for("login"))
    try:
        creds = Credentials(**session["credentials"])
        classroom = build("classroom", "v1", credentials=creds)
        assignments = classroom.courses().courseWork().list(courseId=course_id).execute().get("courseWork", [])
        return render_template("assignments.html", assignments=assignments, course_id=course_id)
    except Exception as e:
        logging.error(f"Error in assignments route: {e}")
        return render_template("error.html", message="Failed to load assignments")

@app.route("/analyze/<course_id>/<assignment_id>")
def analyze(course_id, assignment_id):
    if "credentials" not in session:
        return redirect(url_for("login"))
    try:
        creds = Credentials(**session["credentials"])
        classroom = build("classroom", "v1", credentials=creds)
        drive = build("drive", "v3", credentials=creds)

        students = classroom.courses().students().list(courseId=course_id).execute().get("students", [])
        student_map = {s["userId"]: s["profile"]["name"]["fullName"] for s in students}

        assignment = classroom.courses().courseWork().get(courseId=course_id, id=assignment_id).execute()
        question_text = assignment.get("description", "")
        for material in assignment.get("materials", []):
            if "driveFile" in material:
                file_id = material["driveFile"]["driveFile"]["id"]
                try:
                    content = drive.files().get_media(fileId=file_id).execute()
                    if file_id.endswith(".pdf"):
                        reader = PdfReader(io.BytesIO(content))
                        question_text = "".join(p.extract_text() or "" for p in reader.pages)
                    else:
                        question_text = content.decode("utf-8", errors="ignore")
                except Exception as e:
                    logging.error(f"Failed to read assignment file {file_id}: {e}")
                    question_text = ""
                break

        submissions = classroom.courses().courseWork().studentSubmissions().list(
            courseId=course_id, courseWorkId=assignment_id, states=["TURNED_IN"]
        ).execute().get("studentSubmissions", [])
        
        results = []
        hashes = {}
        submitted_ids = set()

        for sub in submissions:
            user_id = sub["userId"]
            student = student_map.get(user_id, "Unknown")
            submitted_ids.add(user_id)
            status = "Unknown"
            duplicate = False
            filename = "N/A"
            file_size = 0

            if sub.get("state") != "TURNED_IN":
                status = f"Not processed (state: {sub.get('state')})"
            else:
                attachments = sub.get("assignmentSubmission", {}).get("attachments", [])
                for a in attachments:
                    if "driveFile" in a:
                        file_id = a["driveFile"]["id"]
                        try:
                            file_meta = drive.files().get(fileId=file_id, fields="name, size").execute()
                            filename = file_meta["name"]
                            file_size = int(file_meta.get("size", 0))
                            content = drive.files().get_media(fileId=file_id).execute()
                            file_hash = hashlib.sha256(content).hexdigest()

                            if file_hash in hashes:
                                duplicate = True
                                status = "Duplicate file"
                                hashes[file_hash].append({
                                    'student_name': student,
                                    'file_name': filename,
                                    'file_size': file_size
                                })
                            else:
                                hashes[file_hash] = [{
                                    'student_name': student,
                                    'file_name': filename,
                                    'file_size': file_size
                                }]
                                status = analyze_with_ai(content, filename, question_text)
                        except Exception as e:
                            logging.error(f"Failed to process submission file {file_id}: {e}")
                            status = "Error processing file"
            results.append({
                "student_name": student,
                "file_name": filename,
                "duplicate": duplicate,
                "accuracy_status": status
            })

        duplicate_groups = [
            {
                'hash': file_hash,
                'files': files
            }
            for file_hash, files in hashes.items()
            if len(files) > 1
        ]

        non_submitters = [student_map[uid] for uid in student_map if uid not in submitted_ids]

        return render_template(
            "results.html",
            results=results,
            non_submitters=non_submitters,
            duplicate_groups=duplicate_groups,
            total_submissions=len(submissions)
        )
    except Exception as e:
        logging.error(f"Error in analyze route: {e}")
        return render_template("error.html", message="Failed to analyze assignment")

def analyze_with_ai(file_content, file_name, question_text):
    content = ""
    try:
        if file_name.endswith(".pdf"):
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            content = "".join(p.extract_text() or "" for p in reader.pages)
        else:
            content = file_content.decode("utf-8", errors="ignore")
    except Exception as e:
        logging.error(f"Error analyzing file {file_name}: {e}")
        return "Unreadable file"

    if not content.strip():
        return "No content found"

    stop_words = set(stopwords.words("english"))
    q_tokens = set(word_tokenize(question_text.lower())) - stop_words
    s_tokens = set(word_tokenize(content.lower())) - stop_words

    if not q_tokens or not s_tokens:
        return "Invalid content"

    overlap = len(q_tokens & s_tokens) / len(q_tokens)
    return "Accurate" if overlap > 0.2 else "Inaccurate"

if __name__ == "__main__":
    app.run(debug=True)