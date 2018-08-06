import React from 'react'
import styled from 'styled-components'
import './common/globalStyles'

const Main = () => <Header>custom-create-react-app</Header>

export default Main

const Header = styled.header`
  height: 100vh;
  font-weight: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  background-color: #222;
  color: white;
`
