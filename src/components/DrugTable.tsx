
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Drug {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  expiryDate: string;
  batchNumber: string;
  threshold: number;
}

interface DrugTableProps {
  drugs: Drug[];
  setDrugs: (drugs: Drug[]) => void;
}

const DrugTable = ({ drugs, setDrugs }: DrugTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDrug, setCurrentDrug] = useState<Drug | null>(null);
  const [newDrug, setNewDrug] = useState<Partial<Drug>>({
    name: "",
    dosage: "",
    quantity: 0,
    expiryDate: "",
    batchNumber: "",
    threshold: 10,
  });
  
  const { toast } = useToast();

  const filteredDrugs = drugs.filter(drug => 
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDrug = () => {
    if (!newDrug.name || !newDrug.expiryDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const drugToAdd: Drug = {
      id: Date.now().toString(),
      name: newDrug.name || "",
      dosage: newDrug.dosage || "",
      quantity: newDrug.quantity || 0,
      expiryDate: newDrug.expiryDate || "",
      batchNumber: newDrug.batchNumber || "",
      threshold: newDrug.threshold || 10,
    };
    
    setDrugs([...drugs, drugToAdd]);
    setIsAddDialogOpen(false);
    setNewDrug({
      name: "",
      dosage: "",
      quantity: 0,
      expiryDate: "",
      batchNumber: "",
      threshold: 10,
    });
    
    toast({
      title: "Drug Added",
      description: `${drugToAdd.name} has been added to inventory`
    });
  };

  const handleEditDrug = () => {
    if (!currentDrug) return;
    
    const updatedDrugs = drugs.map(drug => 
      drug.id === currentDrug.id ? currentDrug : drug
    );
    
    setDrugs(updatedDrugs);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Drug Updated",
      description: `${currentDrug.name} has been updated`
    });
  };

  const handleDeleteDrug = () => {
    if (!currentDrug) return;
    
    const updatedDrugs = drugs.filter(drug => drug.id !== currentDrug.id);
    setDrugs(updatedDrugs);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Drug Deleted",
      description: `${currentDrug.name} has been removed from inventory`,
      variant: "destructive"
    });
  };

  const openEditDialog = (drug: Drug) => {
    setCurrentDrug({ ...drug });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (drug: Drug) => {
    setCurrentDrug(drug);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Drug) => {
    if (currentDrug) {
      setCurrentDrug({
        ...currentDrug,
        [field]: field === "quantity" || field === "threshold" 
          ? parseInt(e.target.value) || 0
          : e.target.value
      });
    }
  };

  const handleNewDrugChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Drug) => {
    setNewDrug({
      ...newDrug,
      [field]: field === "quantity" || field === "threshold" 
        ? parseInt(e.target.value) || 0
        : e.target.value
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search drugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add New Drug
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrugs.length > 0 ? (
              filteredDrugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell className="font-medium">{drug.name}</TableCell>
                  <TableCell>{drug.dosage}</TableCell>
                  <TableCell className="text-center">
                    <span className={`${drug.quantity <= drug.threshold ? "text-medical-red" : ""}`}>
                      {drug.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`${
                        new Date(drug.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-medical-red" : ""
                      }`}
                    >
                      {drug.expiryDate}
                    </span>
                  </TableCell>
                  <TableCell>{drug.batchNumber}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(drug)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(drug)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "No drugs found matching your search" : "No drugs in inventory. Add some!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Drug Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Drug</DialogTitle>
            <DialogDescription>
              Enter the details of the new drug to add to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="name">Drug Name *</label>
                <Input
                  id="name"
                  value={newDrug.name}
                  onChange={(e) => handleNewDrugChange(e, "name")}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="dosage">Dosage</label>
                <Input
                  id="dosage"
                  value={newDrug.dosage}
                  onChange={(e) => handleNewDrugChange(e, "dosage")}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="quantity">Quantity</label>
                <Input
                  id="quantity"
                  type="number"
                  value={newDrug.quantity}
                  onChange={(e) => handleNewDrugChange(e, "quantity")}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="threshold">Low Stock Threshold</label>
                <Input
                  id="threshold"
                  type="number"
                  value={newDrug.threshold}
                  onChange={(e) => handleNewDrugChange(e, "threshold")}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="expiryDate">Expiry Date *</label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newDrug.expiryDate}
                  onChange={(e) => handleNewDrugChange(e, "expiryDate")}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="batchNumber">Batch Number</label>
                <Input
                  id="batchNumber"
                  value={newDrug.batchNumber}
                  onChange={(e) => handleNewDrugChange(e, "batchNumber")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDrug}>Add Drug</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Drug Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Drug</DialogTitle>
            <DialogDescription>
              Update the details of this drug
            </DialogDescription>
          </DialogHeader>
          {currentDrug && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-name">Drug Name</label>
                  <Input
                    id="edit-name"
                    value={currentDrug.name}
                    onChange={(e) => handleInputChange(e, "name")}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-dosage">Dosage</label>
                  <Input
                    id="edit-dosage"
                    value={currentDrug.dosage}
                    onChange={(e) => handleInputChange(e, "dosage")}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-quantity">Quantity</label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={currentDrug.quantity}
                    onChange={(e) => handleInputChange(e, "quantity")}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-threshold">Low Stock Threshold</label>
                  <Input
                    id="edit-threshold"
                    type="number"
                    value={currentDrug.threshold}
                    onChange={(e) => handleInputChange(e, "threshold")}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-expiryDate">Expiry Date</label>
                  <Input
                    id="edit-expiryDate"
                    type="date"
                    value={currentDrug.expiryDate}
                    onChange={(e) => handleInputChange(e, "expiryDate")}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="edit-batchNumber">Batch Number</label>
                  <Input
                    id="edit-batchNumber"
                    value={currentDrug.batchNumber}
                    onChange={(e) => handleInputChange(e, "batchNumber")}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDrug}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentDrug?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDrug}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrugTable;
