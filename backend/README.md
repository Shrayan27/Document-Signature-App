Sure! Here's the same `README.md` content inside a plain text-style code block for easier copying, like you'd see in a notepad:

```
# 📄 Document Signature App

A full-stack web app to upload PDF documents, request signatures, drag-and-drop a signature onto any page, customize its appearance, and finalize the signature.

---

## 🧩 Tech Stack

### 🔙 Backend
- Node.js + Express
- MongoDB + Mongoose
- Multer – for file uploads
- JWT – user authentication
- PDF-lib – optional PDF manipulation
- Nodemailer – email support
- dotenv, cookie-parser, cors

### 🔜 Frontend
- React 19 + Vite
- Tailwind CSS + DaisyUI
- React-PDF (react-pdf + pdfjs-dist)
- DnD Kit (@dnd-kit/core) – drag-and-drop signatures
- Axios + React Router DOM
- Sonner – toast notifications

---

## ⚙️ Features

- ✅ User authentication (login/register/logout)
- ✅ Upload PDF documents
- ✅ Save number of pages per PDF
- ✅ Create signature request for a document
- ✅ Drag-and-drop signature on any PDF page using DnD Kit
- ✅ Customize signature text: font, size, bold, underline, color
- ✅ Finalize signature (locks position)
- ✅ Dashboard with uploaded documents and signature requests

---

## 🚀 Getting Started

### 1. Clone the Repository

```

git clone [https://github.com/your-username/document-signature-app.git](https://github.com/your-username/document-signature-app.git)
cd document-signature-app

```

---

### 2. Install Dependencies

#### Backend

```

cd backend
npm install

```

#### Frontend

```

cd frontend
npm install

```

---

### 3. Environment Setup

#### Backend (.env)

```

PORT=3000
MONGO_URI=mongodb://localhost:27017/signature-app
JWT_SECRET=your_jwt_secret
EMAIL_USER=[your_email@example.com](mailto:your_email@example.com)
EMAIL_PASS=your_email_password

```

---

### 4. Run the App

#### Backend

```

cd backend
npm run dev

```

#### Frontend

```

cd frontend
npm run dev

```

---

## 🏗️ Project Structure

```

document-signature-app/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── uploads/
│ ├── index.js
│ └── .env
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── public/
│ └── index.html

```

---

## 📂 Key Packages

### Backend

| Package        | Purpose                            |
|----------------|------------------------------------|
| express        | Web server                         |
| mongoose       | MongoDB ORM                        |
| multer         | File upload middleware             |
| jsonwebtoken   | Authentication                     |
| nodemailer     | Email support                      |
| pdf-lib        | (Optional) Embed signature in PDF  |

### Frontend

| Package          | Purpose                                |
|------------------|----------------------------------------|
| react-pdf        | Render PDFs                            |
| pdfjs-dist       | Low-level PDF rendering                |
| @dnd-kit/core    | Drag-and-drop for signature positioning|
| react-hook-form  | Form handling                          |
| tailwindcss      | Styling framework                      |
| sonner           | Toast notifications                    |

---

## 📝 How Signature Works

1. User uploads a PDF document.
2. System extracts and stores number of pages.
3. User places a signature on any page by dragging a styled text box.
4. Signature text can be styled (font, size, color, bold, underline).
5. Once finalized, the signature is locked for that user.

---

## 🛠 Future Improvements

- [ ] Signature embedding directly in PDF via pdf-lib
- [ ] User roles (admin, signer)
- [ ] Multi-signer workflows
- [ ] View-only links for signed documents

---

## 📝 License

MIT

---

## 👨‍💻 Author

Built by Shrayan Mahajan


```
