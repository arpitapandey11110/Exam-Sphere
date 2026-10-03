// src/components/Header.jsx
import logo from "../assets/logo.png"; // Update with your actual logo path

export default function Header() {
  return (
    <header style={styles.header}>
      {/* Logo + App Name */}
      <div style={styles.titleContainer}>
        <img src={logo} alt="ExamSphere Logo" style={styles.logo} />
        <h1 style={styles.appName}>ExamSphere</h1>
      </div>

      {/* Marquee under App Name */}
      <marquee style={styles.marquee}>
        Welcome to ExamSphere! Your one-stop platform for exam resources and teacher tools.
      </marquee>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#0055a5",
    color: "white",
    padding: "15px 20px",
    textAlign: "center", // centers all child text
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // center logo + name horizontally
    gap: "10px",
  },
  logo: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "50%",
  },
  appName: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0,
  },
  marquee: {
    backgroundColor: "#84c3fdff",
    padding: "5px",
    fontSize: "1rem",
    fontWeight: "500",
    marginTop: "8px",
  },
};
