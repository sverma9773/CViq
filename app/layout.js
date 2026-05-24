import "./globals.css";
import { AuthContextProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

export const metadata = {
  title: "CViq — Build Professional Resumes in Minutes",
  description:
    "Create stunning, ATS-friendly resumes for free. Choose from beautiful templates, customize your design, and download unlimited PDFs. Trusted by thousands of job seekers.",
  keywords: "resume builder, CV maker, free resume, ATS-friendly, professional resume",
  openGraph: {
    title: "CViq — Build Professional Resumes in Minutes",
    description:
      "Create stunning, ATS-friendly resumes for free with CViq.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
          <AuthModal />
        </AuthContextProvider>
      </body>
    </html>
  );
}
