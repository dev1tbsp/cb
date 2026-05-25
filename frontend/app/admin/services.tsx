import { api } from '@/src/api/client';
import { adminApi } from '@/src/api/admin';
import { CrudList } from '@/src/components/CrudList';

export default function AdminServices() {
  return (
    <CrudList
      title="Services"
      subtitle="Manage your catering packages"
      fetchList={() => api.get('/services', { auth: false })}
      create={adminApi.createService}
      update={adminApi.updateService}
      remove={adminApi.deleteService}
      emptyDefaults={{ icon: 'restaurant', starting_price: 499, features: [] }}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'starting_price', label: 'Starting Price (₹/plate)', type: 'number', required: true },
        { key: 'icon', label: 'Icon (Ionicons name)', type: 'text', placeholder: 'gift, home, heart, briefcase, star, flame, cube' },
        { key: 'features', label: 'Features (comma-separated)', type: 'list', placeholder: 'Live counters, Mocktail bar, Decor' },
        { key: 'image', label: 'Image', type: 'image' },
      ]}
      renderRow={(item: any) => ({
        primary: item.title,
        secondary: `Starting ₹${item.starting_price}/plate · ${(item.features || []).length} features`,
        image: item.image,
      })}
    />
  );
}
