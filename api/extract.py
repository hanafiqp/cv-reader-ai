import pdfplumber
import io
import json
import base64

def handler(request):
    # Only allow POST
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method Not Allowed"}),
            "headers": {"Content-Type": "application/json"}
        }

    # Parse form-data; Vercel exposes uploaded files in request.files
    try:
        form = request.files
        if not form or "file" not in form:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No file uploaded"}),
                "headers": {"Content-Type": "application/json"}
            }
        pdf_file = form["file"]
        pdf_bytes = pdf_file.read()
        # Simple processing: count pages
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            num_pages = len(pdf.pages)
        return {
            "statusCode": 200,
            "body": json.dumps({"num_pages": num_pages}),
            "headers": {"Content-Type": "application/json"}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }