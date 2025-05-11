import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Drug {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface DrugSearchProps {
  onSell: (drugId: string, quantity: number) => void;
  onRestock: (drugId: string, quantity: number) => void;
  inventory: Drug[];
}

const DrugSearch = forwardRef(function DrugSearch({ onSell, onRestock, inventory }: DrugSearchProps, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [quantity, setQuantity] = useState("");
  const [actionType, setActionType] = useState<"sell" | "restock" | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredDrugs = inventory.filter(drug =>
        drug.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredDrugs);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, inventory]);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true)
  }));

  const handleAction = (drug: Drug, type: "sell" | "restock") => {
    setSelectedDrug(drug);
    setActionType(type);
    setQuantity("");
  };

  const handleSubmit = () => {
    if (selectedDrug && actionType && quantity) {
      const quantityNum = parseInt(quantity);
      if (actionType === "sell") {
        onSell(selectedDrug._id, quantityNum);
      } else {
        onRestock(selectedDrug._id, quantityNum);
      }
      setSelectedDrug(null);
      setActionType(null);
      setQuantity("");
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-label="Close search overlay"
          />
          {/* Search Bar and Results Dropdown Wrapper */}
          <div ref={wrapperRef}>
            <div className="fixed left-1/2 z-50 w-full max-w-2xl -translate-x-1/2" style={{ top: '5rem' }}>
              <div className="bg-white w-full rounded-xl shadow-lg flex items-center px-6 py-4 relative border border-gray-200">
                <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-lg"
                  placeholder="Search drugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="ml-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close search"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Results Dropdown */}
            {searchQuery && searchResults.length > 0 && (
              <div className="fixed left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 bg-white rounded-xl shadow-lg overflow-y-auto max-h-80 border border-t-0 border-gray-200" style={{top: 'calc(5rem + 4.5rem)'}}>
                {searchResults.map((drug) => (
                  <div
                    key={drug._id}
                    className="flex items-center justify-between px-6 py-3 border-b last:border-b-0 hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{drug.name}</div>
                      <div className="text-xs text-gray-500">Stock: {drug.quantity}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => handleAction(drug, "sell")}
                      >Sell</button>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => handleAction(drug, "restock")}
                      >Restock</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={!!selectedDrug} onOpenChange={() => setSelectedDrug(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "sell" ? "Sell Drug" : "Restock Drug"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Drug Name</Label>
              <div className="font-medium">{selectedDrug?.name}</div>
            </div>
            <div>
              <Label>Current Stock</Label>
              <div className="font-medium">
                {selectedDrug?.quantity} {selectedDrug?.unit}
              </div>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter quantity to ${actionType}`}
                className="mt-2"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!quantity || parseInt(quantity) <= 0}
            >
              {actionType === "sell" ? "Sell" : "Restock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default DrugSearch; 