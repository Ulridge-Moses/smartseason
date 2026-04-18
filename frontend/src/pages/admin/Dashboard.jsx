import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../lib/axios'

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-600'
}

const stageColors = {
  PLANTED: 'bg-blue-100 text-blue-700',
  GROWING: 'bg-teal-100 text-teal-700',
  READY: 'bg-orange-100 text-orange-700',
  HARVESTED: 'bg-gray-100 text-gray-600'
}

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fields'],
    queryFn: () => api.get('/fields').then(res => res.data.fields)
  })

  if (isLoading) return (
    <Layout>
      <p className="text-gray-500">Loading fields...</p>
    </Layout>
  )

  if (isError) return (
    <Layout>
      <p className="text-red-500">Failed to load fields.</p>
    </Layout>
  )

  const total = data.length
  const active = data.filter(f => f.status === 'ACTIVE').length
  const atRisk = data.filter(f => f.status === 'AT_RISK').length
  const completed = data.filter(f => f.status === 'COMPLETED').length

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">All fields across all agents</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Fields</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-semibold text-green-600 mt-1">{active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">At Risk</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-1">{atRisk}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-semibold text-gray-600 mt-1">{completed}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">All Fields</h2>
          <Link
            to="/admin/fields"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Manage fields
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {data.map(field => (
            <div key={field.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{field.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {field.cropType} · {field.agent.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded font-medium ${stageColors[field.stage]}`}>
                  {field.stage}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[field.status]}`}>
                  {field.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard