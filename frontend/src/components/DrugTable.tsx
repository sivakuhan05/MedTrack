import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Drug {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  use_period: number;
  price: number;
  reorderLevel: number;
}

interface DrugTableProps {
  drugs: Drug[];
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  onUpdate: (drug: Drug) => void;
  onDelete: (id: string) => void;
}

const DrugTable: React.FC<DrugTableProps> = ({ drugs, setDrugs, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedDrug, setEditedDrug] = useState<Drug | null>(null);

  const handleEdit = (drug: Drug) => {
    setEditingId(drug.id);
    setEditedDrug(drug);
  };

  const handleSave = async () => {
    if (editedDrug) {
      await onUpdate(editedDrug);
      setEditingId(null);
      setEditedDrug(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedDrug(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Use Period (days)</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drugs.map((drug) => (
            <TableRow key={drug.id}>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    value={editedDrug?.name || ""}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                  />
                ) : (
                  <span className="font-medium">{drug.name}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    value={editedDrug?.description || ""}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                  />
                ) : (
                  drug.description
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    type="number"
                    value={editedDrug?.quantity || 0}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, quantity: parseInt(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  drug.quantity
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Select
                    value={editedDrug?.unit || ""}
                    onValueChange={(value) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, unit: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="rolls">Rolls</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  drug.unit
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    type="number"
                    value={editedDrug?.use_period || 0}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, use_period: parseInt(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  drug.use_period
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editedDrug?.price || 0}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, price: parseFloat(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  `₹${drug.price.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <Input
                    type="number"
                    value={editedDrug?.reorderLevel || 0}
                    onChange={(e) =>
                      setEditedDrug((prev) =>
                        prev ? { ...prev, reorderLevel: parseInt(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  drug.reorderLevel
                )}
              </TableCell>
              <TableCell>
                {editingId === drug.id ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(drug)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(drug.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DrugTable;
