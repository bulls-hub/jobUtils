
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
            // Vercel 배포 환경과 로컬 환경에 따른 리다이렉트 처리
            const origin = window.location.origin;
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Login error:', error);
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
                color="secondary"
                startIcon={<GoogleIcon />}
                onClick={handleLogin}
                sx={{ 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                }}
            >
                Google Login
            </Button>
        );
    }

    const { user } = session;
    const displayName = user.user_metadata?.full_name || user.email;
    const avatarUrl = user.user_metadata?.avatar_url;

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
                    vertical: 'bottom',
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
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
        </Box>
    );
}
