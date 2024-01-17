// import React from 'react';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg';
// import './App.css';
// import React, { useState } from 'react';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import SignInPage from './Signin';
import styled from '@emotion/styled';
// import Button from '@mui/material/Button';

const AppDiv = styled.div``;

function App() {
  // const [count, setCount] = React.useState(0);

  return (
    <AppDiv>
      <SignInPage />
    </AppDiv>
  );
}

export default App;
