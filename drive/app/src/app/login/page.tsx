"use client";

import React, { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Grid,
  GridItem,
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  List,
} from '@calimero-network/mero-ui';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';

export default function Authenticate() {
  const { isAuthenticated } = useCalimero();

  return (
    <>
      <MeroNavbar variant="elevated" size="md">
        <NavbarBrand text="KV Store" />
        <NavbarMenu align="right">
          <NavbarItem>
            <CalimeroConnectButton connectionType={ConnectionType.Remote} />
          </NavbarItem>
        </NavbarMenu>
      </MeroNavbar>
    </>
  );
}
