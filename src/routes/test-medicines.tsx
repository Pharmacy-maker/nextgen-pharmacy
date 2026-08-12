import { createFileRoute } from "@tanstack/react-router";
import TestMedicines from "../pages/TestMedicines";

export const Route = createFileRoute("/test-medicines")({
  component: TestMedicines,
});