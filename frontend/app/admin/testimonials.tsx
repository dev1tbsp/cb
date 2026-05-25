import { api } from '@/src/api/client';
import { adminApi } from '@/src/api/admin';
import { CrudList } from '@/src/components/CrudList';

export default function AdminTestimonials() {
  return (
    <CrudList
      title="Testimonials"
      subtitle="Customer reviews & ratings"
      fetchList={() => api.get('/testimonials', { auth: false })}
      create={adminApi.createTestimonial}
      update={adminApi.updateTestimonial}
      remove={adminApi.deleteTestimonial}
      emptyDefaults={{ rating: 5, event_type: 'corporate' }}
      fields={[
        { key: 'name', label: 'Customer Name', type: 'text', required: true },
        { key: 'role', label: 'Role / Designation', type: 'text', required: true, placeholder: 'HR Lead, Kotak' },
        { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
        { key: 'event_type', label: 'Event Type', type: 'text', required: true },
        { key: 'text', label: 'Testimonial Text', type: 'textarea', required: true },
      ]}
      renderRow={(item: any) => ({
        primary: `${item.name} — ${'★'.repeat(item.rating)}`,
        secondary: item.role + ' · ' + item.event_type,
      })}
    />
  );
}
