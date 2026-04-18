import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const FieldDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [stage, setStage] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['field', id],
    queryFn: () => api.get(`/fields/${id}`).then(res => res.data.field)
  })

  const updateMutation = useMutation({
    mutationFn: () => api.post(`/fields/${id}/updates`, { note, stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field', id] })
      queryClient.invalidateQueries({ queryKey: ['my-fields'] })
      setNote('')
      setStage('')
      setShowForm(false)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate()
  }

  if (isLoading) return (
    <Layout>
      <p className="text-gray-500">Loading field...</p>
    </Layout>
  )

  if (isError) return (
    <Layout>
      <p className="text-red-500">Failed to load field.</p>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-8">
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-900 mb-4 block"
        >
          Back to dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{data.name}</h1>
            <p className="text-gray-500 mt-1">{data.cropType}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded font-medium ${stageColors[data.stage]}`}>
              {data.stage}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[data.status]}`}>
              {data.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Planting Date</p>
          <p className="font-medium text-gray-900 mt-1">
            {new Date(data.plantingDate).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Current Stage</p>
          <p className="font-medium text-gray-900 mt-1">{data.stage}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Updates</p>
          <p className="font-medium text-gray-900 mt-1">{data.updates.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Field Updates</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
          >
            Add Update
          </button>
        </div>

        {showForm && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observation
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  rows={3}
                  placeholder="Describe what you observed in the field..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                >
                  <option value="">Select stage</option>
                  {stageOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {data.updates.length === 0 && (
            <p className="px-6 py-4 text-sm text-gray-400">No updates yet.</p>
          )}
          {data.updates.map(update => (
            <div key={update.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs px-2 py-1 rounded font-medium ${stageColors[update.stage]}`}>
                  {update.stage}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(update.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{update.note}</p>
              <p className="text-xs text-gray-400 mt-1">by {update.agent.name}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default FieldDetail