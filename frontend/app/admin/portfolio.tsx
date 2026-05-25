import { api } from '@/src/api/client';
import { adminApi } from '@/src/api/admin';
import { CrudList } from '@/src/components/CrudList';

export default function AdminPortfolio() {
  return (
    <CrudList
      title="Portfolio Items"
      subtitle="Showcase your real events"
      fetchList={() => api.get('/portfolio', { auth: false })}
      create={adminApi.createPortfolio}
      update={adminApi.updatePortfolio}
      remove={adminApi.deletePortfolio}
      emptyDefaults={{ event_type: 'corporate', guest_count: 100, cuisine: 'North Indian' }}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true, placeholder: '150 Pax Corporate Lunch' },
        { key: 'event_type', label: 'Event Type', type: 'text', required: true, placeholder: 'birthday, corporate, pre_wedding, housewarming, festive, house_party' },
        { key: 'guest_count', label: 'Guest Count', type: 'number', required: true },
        { key: 'cuisine', label: 'Cuisine', type: 'text', required: true, placeholder: 'North Indian / Italian / Multi-cuisine' },
        { key: 'image', label: 'Cover Image', type: 'image', required: true },
        { key: 'description', label: 'Case Study Description', type: 'textarea', required: true },
      ]}
      renderRow={(item: any) => ({
        primary: item.title,
        secondary: `${item.guest_count} pax · ${item.cuisine} · ${item.event_type}`,
        image: item.image,
      })}
    />
  );
}
