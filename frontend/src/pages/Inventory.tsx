
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import DrugTable, { Drug } from "@/components/DrugTable";

const Inventory = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);

  useEffect(() => {
    // Load drugs from local storage
    const savedDrugs = localStorage.getItem("medtrack-drugs");
    if (savedDrugs) {
      setDrugs(JSON.parse(savedDrugs));
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem("medtrack-drugs", JSON.stringify(drugs));
  }, [drugs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
        <DrugTable drugs={drugs} setDrugs={setDrugs} />
      </div>
    </div>
  );
};

export default Inventory;
