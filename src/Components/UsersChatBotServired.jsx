import { UserContext } from '../context/UserContext.jsx'
import { useState, useContext, useEffect } from 'react'
import { RenderUsers } from './RenderUsers.jsx'
import { Loading } from './IconSvg.jsx'

function useFilters ({ usuarios }) {
  const [filterUsers, setFilterUsers] = useState('Ninguno')
  const userfiltrados = () => {
    if (filterUsers === 'Ninguno') return usuarios
    else if (filterUsers === 'No Existe') return usuarios.filter(user => user.Estado === 'No Existe')
    else if (filterUsers === 'Si Existe') return usuarios.filter(user => user.Estado === 'Si Existe')
    else return usuarios
  }
  return { userfiltrados, setFilterUsers }
}

export function UserChatBotServired () {
  const [usuarios, setUsuarios] = useState([])
  const { userfiltrados, setFilterUsers } = useFilters({ usuarios })
  const [loading, setLoading] = useState(true)
  const { signalUser } = useContext(UserContext)

  const getDataUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:6060/clientesServired')
      if (response.status === 200) {
        const data = await response.json()
        const cedulas = data.map(user => user.cedula)

        const response2 = await fetch('http://localhost:6060/getCF', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ccs: cedulas })
        })

        if (response2.status === 200) {
          const data2 = await response2.json()
          const updatedUsers = data.map((user, index) => ({
            ...user,
            ...data2[index]
          }))
          setUsuarios(updatedUsers)
          setLoading(false)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getDataUsers()
  }, [signalUser])

  const handleFilter = (ev) => {
    setFilterUsers(ev.target.value)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <h1 className='text-center bg-blue-500 text-white font-bold py-2 rounded-lg flex items-center justify-center'>
        Usuarios Registrados Por Chat Boot
      </h1>
      <table className='text-center'>
        <tr>
          <th>N°</th>
          <th>Nombre</th>
          <th>Cedula</th>
          <th>Correo</th>
          <th>Telefono</th>
          <th>Fecha de Registro</th>
          <th>Estado
            <select id="estado" onChange={ev => handleFilter(ev)} className='ml-3 rounded-md text-black'>
              <option value="Ninguno" className='text-black' selected>Ninguno</option>
              <option value="No Existe" className='text-black'>No Existe</option>
              <option value="Si Existe" className='text-black'>Si Existe</option>
            </select>
          </th>
          <th>Opc Usuario</th>
        </tr>
        <RenderUsers usuarios={userfiltrados(usuarios)} />
      </table>
    </>
  )
}
