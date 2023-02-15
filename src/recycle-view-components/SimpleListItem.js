import React from 'react'

export const SimpleListItem = ({innerRef, data}) => {
  return (
    <div ref={innerRef} style={{minWidth: "100%", minHeight:"50px", position: "relative"}}>{data}</div>
  )
}
