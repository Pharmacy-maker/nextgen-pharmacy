import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Medicine = {
  name: string;
  price: number | null;
  manufacturer: string | null;
};

export default function TestMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedicines() {
      const { data, error } = await supabase
        .from("products")
        .select("name, price, manufacturer")
        .limit(20);

      if (error) {
        console.error("Medicine query error:", error);
        setError(error.message);
        return;
      }

      setMedicines(data ?? []);
    }

    loadMedicines();
  }, []);

  return (
    <div style={{ padding: "50px", color: "white" }}>
      <h1>Supabase Medicine Test</h1>

      {error && <p>Error: {error}</p>}

      {medicines.length === 0 && !error && <p>Loading medicines...</p>}

      {medicines.map((medicine, index) => (
        <div key={index}>
          <strong>{medicine.name}</strong>
          <p>Price: ₹{medicine.price ?? "N/A"}</p>
          <p>Manufacturer: {medicine.manufacturer ?? "N/A"}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}