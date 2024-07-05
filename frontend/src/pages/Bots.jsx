import React from 'react'
import CronTab from '../components/CronTab/CronTab'
import LogReader from '../components/LogReader/LogReader'

const SAC = () => {
  return (
    <div>
      <LogReader />
      <CronTab />
    </div>
  )
}

export default SAC