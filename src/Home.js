import { useState, useEffect } from "react";
import { getCookie, SESSION_ID } from './cookies';
import { serverHost } from "./constants";
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import NewPostButton from './NewPostButton';
import defaultAvatar from './assets/new_avatar_icon.svg';
import NewPostDialog from './NewPostDialog';
import Post from './Post';
import {Stack} from '@mui/material';

const Home = () => {

    //Navigation
    const navigate = useNavigate();

    const [user, setUser] = useState({id: 0, first_name: '', last_name: '', avatar: defaultAvatar, nick_name: ''});
    //const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [openNewPostDialog, setOpenNewPostDialog] = useState(false);
    const [posts, setPosts] = useState(null);
    const [downloadFollowers, setDownloadFollowers] = useState(false);

    const [following, setFollowing] = useState();

   // const [followers, setFollowers] = useState({following: [], followers: []});
    
    const updateFollowers = () => { 
        setDownloadFollowers(!downloadFollowers)
    }

    const newPostButtonClickHandler = () => {
        setOpenNewPostDialog(true);
    }

    const closeNewPostDialogHandler = () => {
        setOpenNewPostDialog(false);
    }

    useEffect(() => {

        const session_id = getCookie(SESSION_ID);

        if (session_id) {

            //Get main page data
            fetch(serverHost + "?" + new URLSearchParams({ session_id }), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(resp => resp.json())
                .then(data => {

                    console.log(data)

                    if (!data) {
                        navigate("/signin");
                        return;
                    }

                    if (!data.payload) {
                        navigate("/signin");
                        return;
                    }

                    if(user===null){
                        navigate("/signin");
                        return;
                    }

                    if (data.error) {
                        throw new Error(data.error.message);
                    }
                   
                    const u = data.payload.user;
                    user.first_name = u.first_name;
                    user.last_name = u.last_name;
                    user.id = u.id;
                    user.avatar = u.avatar;
                    user.nick_name = u.nick_name;
                    //setUser(u);

                    const posts = data.payload.posts;
                    
                    setPosts(posts);        
                                   
                  
                })
                .catch(
                    err => {
                       // alert(err);
                        navigate("/signin");
                        }
                    );
        } else {
            navigate("/signin");
        }
    },[]);


    useEffect(() => {
        const session_id = getCookie(SESSION_ID);
        if(session_id){
            fetch(serverHost+'/following?' + new URLSearchParams({ session_id }),{
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(resp => resp.json())
            .then(data => {
                if(data){
                    console.log(`DATA: ${JSON.stringify(data)}`);
                    if(data.error){
                        throw new Error(`${data.error}`)
                    }
                    if(data.payload){
                        setFollowing(data.payload);
                    }                      
                }
            })
            .catch(err => alert(err));        
        } else {        
            navigate("/signin");
        }
    },[downloadFollowers]);


    
    return (
        <Stack spacing={3} sx={{width: '100%', display: 'flex', alignItems: 'center', mt: 3}}>
            {/* <NavBar updateFollowers={updateFollowers}/> */}
            <NewPostButton user={user} clickHandler={newPostButtonClickHandler} tooltip="New Post"/>
            <NewPostDialog open={openNewPostDialog} closeDialogHandler={closeNewPostDialogHandler} user={user}/>   
            {posts && posts.map(post =>
                {   
                    let isFollowing = undefined;
                    if(following){
                        for(let i = 0; i<following.length; i++){
                            const user = following[i].following;                            
                            const approved = following[i].approved;                           
                            if(user.id === post.user.id){
                                isFollowing = approved;
                                break;                                
                            }
                        }
                    }

                    return <Post
                        post={post}
                        isFollowing={isFollowing}
                        key={post.id}
                        updateFollowers={updateFollowers}
                        />
                    }
                )}
        </Stack>
    );
}

export default Home;