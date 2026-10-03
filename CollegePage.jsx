import { useParams } from "react-router-dom";
import { useState } from "react";
import { useToast } from "./ToastProvider.jsx";

export default function CollegePage() {
  const { collegeName } = useParams();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const toast = useToast();

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    // Upload logic to backend here
    toast.success(`File uploaded for ${decodeURIComponent(collegeName)}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>{decodeURIComponent(collegeName)} Classroom</h1>
      <p>Welcome! Teachers can upload materials here.</p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <textarea
          placeholder="Description of material"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ display: "block", marginTop: "10px", width: "100%" }}
        />
        <button type="submit" style={{ marginTop: "10px" }}>
          Upload
        </button>
      </form>
    </div>
  );
}
