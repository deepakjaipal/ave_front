'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from "@/lib/api";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Upload,
  Calendar,
  DollarSign,
  Percent,
  Package
} from 'lucide-react';

interface DealItem {
  title: string;
  discount: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  category: string;
}

interface FlashDealSection {
  _id: string;
  type: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  deals: DealItem[];
  endTime: string;
}

export default function FlashDealsDashboard() {
  const [section, setSection] = useState<FlashDealSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [formData, setFormData] = useState<DealItem>({
    title: '',
    discount: '',
    image: '',
    originalPrice: 0,
    salePrice: 0,
    category: ''
  });

  // Fetch flash deals
  useEffect(() => {
    fetchFlashDeals();
  }, []);

 const fetchFlashDeals = async () => {
  try {
    const res = await api.get("/home-sections/public");
    const flashDeals = res.data.find((s: any) => s.type === "flash_deals");

    if (flashDeals) {
      setSection(flashDeals);
    }
  } catch (error) {
    console.error("Failed to load flash deals", error);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (field: keyof DealItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      discount: '',
      image: '',
      originalPrice: 0,
      salePrice: 0,
      category: ''
    });
    setEditingIndex(null);
    setIsAddingNew(false);
  };

  const handleEdit = (deal: DealItem, index: number) => {
    setFormData(deal);
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAddingNew(true);
  };

const handleSave = async () => {
  if (!section) return;

  try {
    const updatedDeals = [...section.deals];

    if (isAddingNew) {
      updatedDeals.push(formData);
    } else if (editingIndex !== null) {
      updatedDeals[editingIndex] = formData;
    }

    await api.put(`/home-sections/${section._id}`, {
      ...section,
      deals: updatedDeals,
    });

    await fetchFlashDeals();
    resetForm();
    alert(isAddingNew ? "Deal added successfully!" : "Deal updated successfully!");
  } catch (error) {
    console.error("Error saving deal:", error);
    alert("Error saving deal");
  }
};

  const handleDelete = async (index: number) => {
  if (!section || !confirm("Are you sure you want to delete this deal?")) return;

  try {
    const updatedDeals = section.deals.filter((_, i) => i !== index);

    await api.put(`/home-sections/${section._id}`, {
      ...section,
      deals: updatedDeals,
    });

    await fetchFlashDeals();
    alert("Deal deleted successfully!");
  } catch (error) {
    console.error("Error deleting deal:", error);
    alert("Error deleting deal");
  }
};

  const handleToggleEnabled = async () => {
  if (!section) return;

  try {
    await api.put(`/home-sections/${section._id}`, {
      ...section,
      enabled: !section.enabled,
    });

    await fetchFlashDeals();
    alert(`Flash deals ${!section.enabled ? "enabled" : "disabled"} successfully!`);
  } catch (error) {
    console.error("Error toggling enabled status:", error);
  }
};

const handleUpdateEndTime = async (newEndTime: string) => {
  if (!section) return;

  try {
    await api.put(`/home-sections/${section._id}`, {
      ...section,
      endTime: newEndTime,
    });

    await fetchFlashDeals();
    alert("End time updated successfully!");
  } catch (error) {
    console.error("Error updating end time:", error);
  }
};



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">No flash deals section found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flash Deals Dashboard</h1>
          <p className="text-gray-600">Manage your flash deals, pricing, and promotions</p>
        </div>

        {/* Section Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="endTime" className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                defaultValue={section.endTime?.slice(0, 16)}
                onChange={(e) => handleUpdateEndTime(new Date(e.target.value).toISOString())}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleToggleEnabled}
                variant={section.enabled ? "default" : "outline"}
                className={section.enabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {section.enabled ? 'Enabled' : 'Disabled'}
              </Button>
              <Button onClick={handleAddNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add New Deal
              </Button>
            </div>
          </div>
        </Card>

        {/* Add/Edit Form */}
        {(isAddingNew || editingIndex !== null) && (
          <Card className="p-6 mb-6 border-2 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isAddingNew ? 'Add New Deal' : 'Edit Deal'}
              </h2>
              <Button onClick={resetForm} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  Product Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Takis Fuego Snacks"
                />
              </div>

              <div>
                <Label htmlFor="category" className="mb-2 block">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Snacks"
                />
              </div>

              <div>
                <Label htmlFor="image" className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4" />
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="discount" className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4" />
                  Discount
                </Label>
                <Input
                  id="discount"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  placeholder="e.g., 40%"
                />
              </div>

              <div>
                <Label htmlFor="originalPrice" className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Original Price
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="salePrice" className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Sale Price
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {formData.image && (
              <div className="mt-4">
                <Label className="mb-2 block">Preview</Label>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                {isAddingNew ? 'Add Deal' : 'Save Changes'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.deals.map((deal, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-red-500">
                  {deal.discount} OFF
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{deal.category}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-orange-600 text-xl">
                    ${deal.salePrice.toFixed(2)}
                  </span>
                  <span className="line-through text-gray-400">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(deal, index)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(index)}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {section.deals.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No deals added yet</p>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Deal
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}