import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import api from '../../lib/axios'

const stageOptions = ['PLANTED', 'GROWING', 'READY', 'HARVESTED']

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

const emptyForm = {
  name: '',
  cropType: '',
  plantingDate: '',
  agentId: '',
  stage: 'PLANTED'
}

const AdminFields = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const { data: fields, isLoading } = useQuery({
    queryKey: ['fields'],
    queryFn: () => api.get('/fields').then(res => res.data.fields)
  })

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/auth/agents').then(res => res.data.agents)
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/fields', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] })
      setShowForm(false)
      setForm(emptyForm)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/fields/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] })
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/fields/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const handleEdit = (field) => {
    setForm({
      name: field.name,
      cropType: field.cropType,
      plantingDate: field.plantingDate.split('T')[0],
      agentId: field.agentId,
      stage: field.stage
    })
    setEditingId(field.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this field?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return (
    <Layout>
      <p className="text-gray-500">Loading...</p>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fields</h1>
          <p className="text-gray-500 mt-1">Manage and assign fields</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
        >
          Add Field
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Field' : 'New Field'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type
              </label>
              <input
                type="text"
                value={form.cropType}
                onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planting Date
              </label>
              <input
                type="date"
                value={form.plantingDate}
                onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {stageOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Agent
              </label>
              <select
                value={form.agentId}
                onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              >
                <option value="">Select an agent</option>
                {agents?.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
              >
                {editingId ? 'Update Field' : 'Create Field'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null) }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="divide-y divide-gray-100">
          {fields?.map(field => (
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
                <button
                  onClick={() => handleEdit(field)}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(field.id)}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default AdminFields