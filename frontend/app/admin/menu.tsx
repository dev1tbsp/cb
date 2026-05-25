import { api } from '@/src/api/client';
import { adminApi } from '@/src/api/admin';
import { CrudList } from '@/src/components/CrudList';

export default function AdminMenu() {
  return (
    <CrudList
      title="Menu Items"
      subtitle="Manage dishes, pricing, badges and images"
      fetchList={() => api.get('/menu', { auth: false })}
      create={adminApi.createMenu}
      update={adminApi.updateMenu}
      remove={adminApi.deleteMenu}
      emptyDefaults={{ category: 'North Indian', price_min: 100, price_max: 200, spice_level: 1, is_jain: false, is_live_counter: false }}
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Paneer Butter Masala' },
        { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'North Indian, South Indian, Chinese, Italian, Chaat, Snacks, Desserts, Mocktails, Kids Menu, Jain Menu' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'price_min', label: 'Price (Min ₹)', type: 'number', required: true },
        { key: 'price_max', label: 'Price (Max ₹)', type: 'number', required: true },
        { key: 'spice_level', label: 'Spice Level (0-3)', type: 'number' },
        { key: 'is_jain', label: 'Jain Friendly', type: 'switch' },
        { key: 'is_live_counter', label: 'Live Counter Dish', type: 'switch' },
        { key: 'image', label: 'Image', type: 'image' },
      ]}
      renderRow={(item: any) => ({
        primary: item.name,
        secondary: `${item.category} · ₹${item.price_min}-${item.price_max}`,
        image: item.image,
        badges: [
          item.is_jain && 'JAIN',
          item.is_live_counter && 'LIVE',
          item.spice_level > 0 && `${'🌶'.repeat(item.spice_level)}`,
        ].filter(Boolean) as string[],
      })}
    />
  );
}
