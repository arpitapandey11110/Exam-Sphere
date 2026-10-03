import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";

<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/college/:collegeName/teacher" element={<TeacherPortal />} />
  <Route path="/college/:collegeName/student" element={<StudentPortal />} />
</Routes>
