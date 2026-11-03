import React from 'react'
import './spinner.scss'

const Spinner = ({ message = "Loading..." }) => (
    <main className='spinner-screen'>
        <div className='spinner' />
        <p className='spinner__msg'>{message}</p>
    </main>
)

export default Spinner
