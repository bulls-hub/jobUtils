
import React, { useState } from 'react';
import { Button, Avatar, Menu, MenuItem, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { supabase } from '../lib/supabaseClient';

export default function AuthWidget({ session }) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.hostname === 'localhost' 
                        ? window.location.origin 
                        : (process.env.REACT_APP_AUTH_REDIRECT_URI || window.location.origin)
                }
            });
            if (error) throw error;
        } catch (error) {
            alert('로그인 중 오류가 발생했습니다: ' + error.message);
        }
    };

    const handleLogout = async () => {
        handleClose();
        await supabase.auth.signOut();
    };

    if (!session) {
        return (
            <Button
                variant="contained"
                color="secondary" // 조금 더 눈에 띄게
                startIcon={<GoogleIcon />}
                onClick={handleLogin}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
                Login with Google
            </Button>
        );
    }

    const { user } = session;
    const displayName = user.user_metadata.full_name || user.email;
    const avatarUrl = user.user_metadata.avatar_url;

    return (
        <Box>
            <Button
                onClick={handleMenu}
                color="inherit"
                startIcon={avatarUrl ? <Avatar src={avatarUrl} sx={{ width: 24, height: 24 }} /> : <AccountCircleIcon />}
                sx={{ textTransform: 'none' }}
            >
                <Typography variant="body1" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
                    {displayName}
                </Typography>
            </Button>
            <Menu
                id="menu-appbar-auth"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem disabled>
                    <Typography variant="caption">{user.email}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
        </Box>
    );
}
