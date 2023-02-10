import React from 'react'

export const SimpleListItem = ({innerRef}) => {
  return (
    <div ref={innerRef} style={{minWidth: "100%", minHeight:"50px", position: "relative"}}>SimpleListItem</div>
  )
}
