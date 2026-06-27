import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Upload, StoreIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';

const InputField = ({ label, ...props }) => (
    <div className="w-full flex pl-[3px] items-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm">
      <div className="min-w-[9%] px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
        {label}
      </div>
      <input
        className="flex-1 bg-transparent p-3 h-11.5 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
        {...props}
        onChange={e => props.onChange?.(e.target.value)}
      />
    </div>
  );

  const TextareaField = ({ label, className = '', inputClassName = '', onChange, ...props }) => (
    <div className={`w-full flex pl-[1.5px] items-start bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm ${className}`}>
      <div className="min-w-[9%] px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
        {label}
      </div>
      <textarea
        className={`flex-1 bg-transparent p-3 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100 resize-y ${inputClassName}`}
        {...props}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );

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

  // Fungsi validasi URL menggunakan regex (Wajib http:// atau https://)
  const isValidUrl = (url) => {
    if (!url) return true; // Anggap valid jika kosong karena opsional
    return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url);
  };

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
    setProducts(prev => prev.filter((_, i) => i !== index));
    toast.success('Produk dihapus');
  };

  return (
    <div className="space-y-6 pb-0">
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg"><StoreIcon size={20} /></div>
            <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Label produk </h3>
            </div>
        </div>
        {/* Tombol Tambah Produk - Hanya muncul jika belum ada produk */}
        {products.length === 0 && (
          <button
            onClick={addProduct}
            className="cursor-pointer active:scale-[0.98] mt-6 w-full py-3.5 border-2 border-dashed border-blue-500 text-blue-500 font-black rounded-xl hover:bg-blue-900/10 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Tambah Produk
          </button>
        )}

        <div className="mt-8">
          {products.map((p, i) => {
            const isLinkValid = isValidUrl(p.link);

            return (
            <div key={i} className="md:border-2 border-slate-200 md:dark:border-slate-700 p-0 md:p-6 md:py-4.5 md:bg-slate-50 md:dark:bg-slate-800 rounded-xl">
      
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

              <div className="mb-3">
                <InputField
                  label="Nama"
                  value={p.name}
                  onChange={v => updateProduct(i, 'name', v)}
                  placeholder="Nama Produk"
                />
              </div>

              <div className="grid grid-cols-1 mt-4 md:grid-cols-1 gap-4">
                <InputField
                  label="Harga (Rp)"
                  type="number"
                  value={p.price}
                  onChange={v => updateProduct(i, 'price', Number(v))}
                  placeholder="0"
                />
               <div>
                <InputField
                    label="Link"
                    value={p.link}
                    onChange={v => updateProduct(i, 'link', v)}
                    placeholder="https://..."
                  />
                  {/* {!isLinkValid && (
                    <p className="text-xs text-red-300 mt-2 font-bold">
                      ⚠️ Link tidak valid! Wajib diawali dengan http:// atau https://
                    </p>
                  )} */}
                </div>
              </div>

              <div className="mt-4">
                <TextareaField
                  label="Deskripsi"
                  value={p.description}
                  onChange={v => updateProduct(i, 'description', v)}
                  placeholder="Deskripsi singkat (opsional)"
                  inputClassName="h-24"
                />
              </div>
              {/* Tombol Hapus Produk */}
              <button
                onClick={() => removeProduct(i)}
                className="cursor-pointer w-full bg-red-500 text-white flex justify-center py-4 mt-5 items-center gap-1.5 text-xs font-black text-red-500 hover:text-white hover:bg-red-50 dark:hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
            )
          })}
        </div>

        {products.length > 0 && (
          <button
            onClick={() => saveMutation.mutate(products)}
            disabled={saveMutation.isPending}
            className="cursor-pointer active:scale-[0.99] mt-10 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Produk ke OBS'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StoreManager;