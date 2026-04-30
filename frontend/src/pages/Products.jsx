import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter, Package, PlusCircle, MinusCircle, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import ConfirmModal from '../components/ConfirmModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Pagination & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [formData, setFormData] = useState({
    category_id: '', subcategory_id: '', name: '', slug: '',
    short_description: '', description: '', meta_title: '',
    meta_description: '', meta_keywords: '', status: 1
  });

  // Dynamic arrays
  const [variations, setVariations] = useState([
    { variation_name: '', sku: '', unit: '', weight: '' }
  ]);
  const [images, setImages] = useState([]);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => { fetchProducts(); }, [page, statusFilter, categoryFilter, refreshTrigger]);

  useEffect(() => {
    if (formData.category_id) fetchSubCategories(formData.category_id);
    else setSubCategories([]);
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { params: { limit: 200, status: 1 } });
      setCategories(res.data.categories || []);
    } catch { toast.error('Failed to load categories'); }
  };

  const fetchSubCategories = async (catId) => {
    try {
      const res = await api.get('/sub-categories', { params: { category_id: catId, limit: 200, status: 1 } });
      setSubCategories(res.data.subCategories || []);
    } catch { toast.error('Failed to load sub-categories'); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { page, search, status: statusFilter, category_id: categoryFilter, limit: 10 },
      });
      setProducts(res.data.products);
      setTotalPages(res.data.pages);
      setTotalItems(res.data.total);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name') updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return updated;
    });
  };

  // --- Variations Logic ---
  const handleVariationChange = (index, field, value) => {
    const newVars = [...variations];
    newVars[index][field] = value;
    setVariations(newVars);
  };
  const addVariation = () => setVariations([...variations, { variation_name: '', sku: '', unit: '', weight: '' }]);
  const removeVariation = (index) => setVariations(variations.filter((_, i) => i !== index));

  // --- Images Logic ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file, preview: URL.createObjectURL(file), alt_text: '', meta_title: '', meta_description: '', is_primary: 0
    }));
    setImages(prev => [...prev, ...newImages]);
  };
  const handleImageMetaChange = (index, field, value) => {
    const newImgs = [...images];
    newImgs[index][field] = value;
    if (field === 'is_primary' && value) {
      newImgs.forEach((img, i) => { if (i !== index) img.is_primary = 0; });
    }
    setImages(newImgs);
  };
  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const resetForm = () => {
    setFormData({ category_id: '', subcategory_id: '', name: '', slug: '', short_description: '', description: '', meta_title: '', meta_description: '', meta_keywords: '', status: 1 });
    setVariations([{ variation_name: '', sku: '', unit: '', weight: '' }]);
    setImages([]);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const openAddForm = () => { resetForm(); setIsFormOpen(true); };

  const openEditForm = async (product) => {
    try {
      const res = await api.get(`/products/${product.id}`);
      const p = res.data.product;
      setFormData({
        category_id: p.category_id, subcategory_id: p.subcategory_id || '', name: p.name, slug: p.slug,
        short_description: p.short_description || '', description: p.description || '',
        meta_title: p.meta_title || '', meta_description: p.meta_description || '',
        meta_keywords: p.meta_keywords || '', status: p.status,
      });
      if (p.variations && p.variations.length > 0) {
        setVariations(p.variations.map(v => ({ variation_name: v.variation_name, sku: v.sku, unit: v.unit || '', weight: v.weight || '' })));
      } else { setVariations([{ variation_name: '', sku: '', unit: '', weight: '' }]); }
      if (p.images && p.images.length > 0) {
        setImages(p.images.map(img => ({
          id: img.id,
          file: null,
          preview: `${IMAGE_BASE_URL}/ProductImages/${img.image}`,
          alt_text: img.alt_text || '',
          meta_title: img.meta_title || '',
          meta_description: img.meta_description || '',
          is_primary: img.is_primary === 1
        })));
      } else {
        setImages([]);
      }
      setSelectedId(p.id);
      setIsEditMode(true);
      setIsFormOpen(true);
    } catch { toast.error("Failed to fetch product details"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id) return toast.error('Category is required');
    if (variations.length === 0) return toast.error('At least one variation is required');
    if (!isEditMode && images.length === 0) return toast.error('At least one image is required');

    setSubmitting(true);
    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    payload.append('variations', JSON.stringify(variations));

    const existingImagesData = images
      .filter(img => img.id)
      .map(img => ({
        id: img.id,
        alt_text: img.alt_text,
        meta_title: img.meta_title,
        meta_description: img.meta_description,
        is_primary: img.is_primary ? 1 : 0
      }));
    if (existingImagesData.length > 0 || isEditMode) {
      payload.append('existing_images', JSON.stringify(existingImagesData));
    }

    images.forEach(img => {
      if (img.file) {
        payload.append('product_images', img.file);
        payload.append('image_alt_texts', img.alt_text);
        payload.append('image_meta_titles', img.meta_title);
        payload.append('image_meta_descriptions', img.meta_description);
        payload.append('image_is_primary', img.is_primary ? '1' : '0');
      }
    });

    try {
      if (isEditMode) {
        await api.put(`/products/${selectedId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setIsFormOpen(false);
      resetForm();
      setPage(1);
      setRefreshTrigger(t => t + 1);
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const toggleStatus = async (p) => {
    try {
      await api.patch(`/products/${p.id}/status`, { status: p.status === 1 ? 0 : 1 });
      toast.success('Status updated');
      setRefreshTrigger(t => t + 1);
    } catch { toast.error('Failed to update status'); }
  };

  const confirmDelete = (id) => { setIdToDelete(id); setIsDeleteModalOpen(true); };

  const deleteProduct = async () => {
    try {
      await api.delete(`/products/${idToDelete}`);
      toast.success('Product deleted');
      setIsDeleteModalOpen(false);
      setRefreshTrigger(t => t + 1);
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* BASE INFO */}
            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category *</label>
                <select name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sub Category</label>
                <select name="subcategory_id" value={formData.subcategory_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm">
                  <option value="">Select Sub Category</option>
                  {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug (Auto)</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm font-mono" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Description</label>
              <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm"></textarea>
            </div>
            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm"></textarea>
            </div>

            {/* VARIATIONS */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-bold text-slate-700">2. Product Variations *</h3>
              <button type="button" onClick={addVariation} className="flex items-center text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-200">
                <PlusCircle className="w-4 h-4 mr-1" /> Add Variation
              </button>
            </div>
            {variations.map((v, index) => (
              <div key={index} className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input type="text" placeholder="Variation Name (e.g. 500ml)" value={v.variation_name} onChange={(e) => handleVariationChange(index, 'variation_name', e.target.value)} required className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                <input type="text" placeholder="SKU" value={v.sku} onChange={(e) => handleVariationChange(index, 'sku', e.target.value)} required className="flex-1 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                <input type="text" placeholder="Unit (e.g. ml)" value={v.unit} onChange={(e) => handleVariationChange(index, 'unit', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                <input type="text" placeholder="Weight" value={v.weight} onChange={(e) => handleVariationChange(index, 'weight', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                {variations.length > 1 && (
                  <button type="button" onClick={() => removeVariation(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><MinusCircle className="w-5 h-5" /></button>
                )}
              </div>
            ))}

            {/* IMAGES */}
            <div className="flex justify-between items-center border-b pb-2 mb-4 mt-8">
              <h3 className="font-bold text-slate-700">3. Product Images {!isEditMode && '*'}</h3>
              <div className="relative">
                <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                <button type="button" className="flex items-center text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
                  <ImageIcon className="w-4 h-4 mr-1" /> Add Images
                </button>
              </div>
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {images.map((img, index) => (
                  <div key={index} className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 items-start">
                    <img src={img.preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Alt Text" value={img.alt_text} onChange={(e) => handleImageMetaChange(index, 'alt_text', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs" />
                      <input type="text" placeholder="Meta Title" value={img.meta_title} onChange={(e) => handleImageMetaChange(index, 'meta_title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs" />
                      <div className="flex justify-between items-center">
                        <label className="text-xs flex items-center gap-1 font-bold text-slate-600">
                          <input type="checkbox" checked={img.is_primary} onChange={(e) => handleImageMetaChange(index, 'is_primary', e.target.checked)} className="rounded text-violet-600" /> Primary
                        </label>
                        <button type="button" onClick={() => removeImage(index)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-8">No new images selected.</p>
            )}

            {/* SEO & STATUS */}
            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">4. SEO & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Title</label>
                <input type="text" name="meta_title" value={formData.meta_title} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Keywords</label>
                <input type="text" name="meta_keywords" value={formData.meta_keywords} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Description</label>
                <textarea name="meta_description" value={formData.meta_description} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-violet-200 text-sm">
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-2 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Product Management</h1>
              <p className="text-slate-500 text-sm mt-1">Manage catalog products and variations.</p>
            </div>
            <button onClick={openAddForm} className="flex items-center px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold shadow-lg hover:bg-violet-700 active:scale-95">
              <Plus className="w-5 h-5 mr-2" /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-4 flex-wrap">
              <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-200" />
              </form>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-200">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-200">
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Image</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-500">Loading...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-500">No products found.</td></tr>
                  ) : products.map(p => {
                    const primaryImg = p.images?.find(img => img.is_primary) || p.images?.[0];
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4 text-xs font-mono text-slate-400">#{p.id}</td>
                        <td className="p-4">
                          <div className="w-10 h-10 rounded border bg-white overflow-hidden">
                            {primaryImg ? <img src={`${IMAGE_BASE_URL}/ProductImages/${primaryImg.image}`} alt="img" className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-slate-300" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-sm text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.slug}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded text-[10px] font-bold">{p.category?.name || '-'}</span>
                          {p.subCategory && <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">{p.subCategory.name}</span>}
                        </td>
                        <td className="p-4">
                          <button onClick={() => toggleStatus(p)} className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {p.status === 1 ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => openEditForm(p)} className="p-2 text-slate-400 hover:text-blue-600 rounded bg-slate-50 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => confirmDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 rounded bg-slate-50 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-xs text-slate-500 font-bold">Showing {products.length} of {totalItems}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 rounded text-xs font-bold ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Product" message="Are you sure you want to delete this product?" onConfirm={deleteProduct} onCancel={() => setIsDeleteModalOpen(false)} confirmLabel="Delete" />
    </div>
  );
};

export default Products;
