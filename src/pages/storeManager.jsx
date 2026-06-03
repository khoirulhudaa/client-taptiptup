import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Upload, StoreIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';

const StoreManager = ({ overlayToken }) => {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['storeProducts', overlayToken],
    queryFn: async () => {
      const res = await api.get(`/api/overlay/store/${overlayToken}`);
      return res.data.products || [];
    }
  });

  useEffect(() => {
    if (data) setProducts(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (newProducts) => 
      api.put(`/api/overlay/store/${overlayToken}`, { products: newProducts }),
    onSuccess: () => {
      queryClient.invalidateQueries(['storeProducts', overlayToken]);
      toast.success('✅ Produk berhasil disimpan');
    }
  });

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/overlay/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newProducts = [...products];
      newProducts[index].imageUrl = res.data.url;
      setProducts(newProducts);
      toast.success('Gambar berhasil diupload');
    } catch (err) {
      toast.error('Gagal upload gambar');
    }
  };

  const addProduct = () => {
    if (products.length >= 1) return; // Batasi hanya 1 produk
    setProducts([{
      name: '',
      price: 0,
      imageUrl: '',
      link: '',
      description: 'Link di deskripsi 👇'
    }]);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const removeProduct = (index) => {
    setProducts([]);
  };

  return (
    <div className="space-y-6 pb-0">
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-none border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3 rounded-none text-white shadow-lg"><StoreIcon size={20} /></div>
            <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Konfigurasi Toko </h3>
            </div>
        </div>
        {/* Tombol Tambah Produk - Hanya muncul jika belum ada produk */}
        {products.length === 0 && (
          <button
            onClick={addProduct}
            className="mt-6 w-full py-4 border-2 border-dashed border-blue-500 text-blue-600 font-black rounded-none hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Tambah Produk
          </button>
        )}

        <div className="mt-8">
          {products.map((p, i) => (
            <div key={i} className="md:border-2 border-slate-200 md:dark:border-slate-700 p-0 md:p-6 md:py-4.5 md:bg-slate-50 md:dark:bg-slate-800 rounded-none">
              {/* <div className="flex justify-between mb-4">
                <button onClick={() => removeProduct(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div> */}

              {/* Upload Gambar */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Gambar Produk</label>
                <div className="md:flex gap-4 items-center">
                  <label className="cursor-pointer flex-1">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 h-52 flex flex-col items-center justify-center hover:border-blue-400 transition-all">
                      <Upload size={32} className="text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-500">Klik untuk upload gambar</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP (max 3MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, i)}
                      className="hidden"
                    />
                  </label>

                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt="preview"
                      className="h-max md:h-52 w-full md:w-52 object-cover border border-dashed border-slate-200/20"
                    />
                  )}
                </div>
              </div>

              <input
                placeholder="Nama Produk"
                value={p.name}
                onChange={e => updateProduct(i, 'name', e.target.value)}
                className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-none mb-3 font-medium"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Harga (Rp)"
                  value={p.price}
                  onChange={e => updateProduct(i, 'price', Number(e.target.value))}
                  className="p-4 border border-slate-300 dark:border-slate-600 rounded-none font-medium"
                />
                <input
                  placeholder="Link Produk (Opsional)"
                  value={p.link}
                  onChange={e => updateProduct(i, 'link', e.target.value)}
                  className="p-4 border border-slate-300 dark:border-slate-600 rounded-none font-medium"
                />
              </div>

              <textarea
                placeholder="Deskripsi singkat (opsional)"
                value={p.description}
                onChange={e => updateProduct(i, 'description', e.target.value)}
                className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-none h-24 mt-4 font-medium"
              />
            </div>
          ))}
        </div>

        {products.length > 0 && (
          <button
            onClick={() => saveMutation.mutate(products)}
            disabled={saveMutation.isPending}
            className="cursor-pointer active:scale-[0.99] mt-10 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-none transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Produk ke Toko OBS'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StoreManager;