import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import DrugTable, { Drug } from "@/components/DrugTable";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const Inventory = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New drug form state
  const [newDrug, setNewDrug] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "",
    use_period: "30", // Default to 30 days
    price: "",
    reorderLevel: ""
  });

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching inventory items..."); // Debug log
      
      const response = await fetch("/api/inventory");
      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Debug log
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data); // Debug log
      
      // Transform the data to match the Drug interface
      const transformedData = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        use_period: item.use_period,
        price: item.price,
        reorderLevel: item.reorder_level
      }));
      
      console.log("Transformed data:", transformedData); // Debug log
      setDrugs(transformedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch inventory items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrugUpdate = async (updatedDrug: Drug) => {
    try {
      const response = await fetch(`/api/inventory/${updatedDrug.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedDrug.name,
          description: updatedDrug.description,
          quantity: updatedDrug.quantity,
          unit: updatedDrug.unit,
          use_period: updatedDrug.use_period,
          price: updatedDrug.price,
          reorder_level: updatedDrug.reorderLevel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      await fetchDrugs(); // Refresh the list after update
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      console.error("Error updating drug:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDrugDelete = async (drugId: string) => {
    try {
      console.log("Deleting drug with ID:", drugId); // Debug log
      
      // Ensure we're using the MongoDB _id
      const response = await fetch(`/api/inventory/${drugId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Update local state immediately
      setDrugs(prevDrugs => prevDrugs.filter(drug => drug.id !== drugId));
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting drug:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateDrug = async () => {
    try {
      // Validate required fields
      if (!newDrug.name || !newDrug.description || !newDrug.quantity || !newDrug.unit || !newDrug.price || !newDrug.reorderLevel) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const itemData = {
        name: newDrug.name,
        description: newDrug.description,
        quantity: Number(newDrug.quantity),
        unit: newDrug.unit,
        use_period: Number(newDrug.use_period),
        price: Number(newDrug.price),
        reorder_level: Number(newDrug.reorderLevel)
      };

      console.log("Sending data to server:", itemData); // Debug log

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check if it's a duplicate key error
        if (responseData.detail && responseData.detail.includes("duplicate key error")) {
          throw new Error("An item with this name already exists. Please use a different name or update the existing item.");
        }
        throw new Error(responseData.detail || `HTTP error! status: ${response.status}`);
      }

      // If we get here, the item was created successfully
      await fetchDrugs(); // Refresh the list
      setIsDialogOpen(false); // Close the dialog
      
      // Reset form
      setNewDrug({
        name: "",
        description: "",
        quantity: "",
        unit: "",
        use_period: "30",
        price: "",
        reorderLevel: ""
      });

      toast({
        title: "Success",
        description: "New item added successfully",
      });
    } catch (error) {
      console.error("Error creating drug:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add new item. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newDrug.name}
                    onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDrug.description}
                    onChange={(e) => setNewDrug({ ...newDrug, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newDrug.quantity}
                      onChange={(e) => setNewDrug({ ...newDrug, quantity: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={newDrug.unit}
                      onValueChange={(value) => setNewDrug({ ...newDrug, unit: value })}
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
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="use_period">Use Period (days)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of days the item can be used after opening</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="use_period"
                    type="number"
                    value={newDrug.use_period}
                    onChange={(e) => setNewDrug({ ...newDrug, use_period: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newDrug.price}
                      onChange={(e) => setNewDrug({ ...newDrug, price: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>When quantity falls below this number, you should reorder more stock</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={newDrug.reorderLevel}
                      onChange={(e) => setNewDrug({ ...newDrug, reorderLevel: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDrug}>Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <DrugTable 
            drugs={drugs} 
            setDrugs={setDrugs} 
            onUpdate={handleDrugUpdate}
            onDelete={handleDrugDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
