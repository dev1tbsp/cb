import { api } from '@/src/api/client';
import { adminApi } from '@/src/api/admin';
import { CrudList } from '@/src/components/CrudList';

export default function AdminClients() {
  return (
    <CrudList
      title="Corporate Clients"
      subtitle="Trusted by logos shown on home"
      fetchList={() => api.get('/corporate-clients', { auth: false })}
      create={adminApi.createClient}
      update={adminApi.updateClient}
      remove={adminApi.deleteClient}
      fields={[
        { key: 'name', label: 'Company Name', type: 'text', required: true },
        { key: 'logo', label: 'Logo Image', type: 'image', required: true },
      ]}
      renderRow={(item: any) => ({
        primary: item.name,
        image: item.logo,
      })}
    />
  );
}
