import express from "express";
import multer from "multer";
import cors from "cors";
import rulesRouter from "./routes/rules.js";

const app = express();
const upload = multer({ dest: "./admin/uploads" });

app.use(cors());
app.use(express.json());

app.use("/rules", rulesRouter(upload));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🛠️ Admin API running on http://localhost:${PORT}`);
});
