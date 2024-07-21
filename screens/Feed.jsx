import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, FAB, IconButton, Text } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import AddPost from './Post';

const randomUserNames = [
    'tabletennismessier81',
    'figboxinghanggliding',
    'baritoneverdantflora',
    'cornabloomdillpickle',
    'milkthepianistpisces'
]

const Post = ({ id, user, title, image, likes, createdAt }) => {

    const likePost = async () => {
        const db = getFirestore(app);
        await setDoc(doc(db, "feeds", id), {
            likes: likes + 1,
        }, { merge: true });
    }

    // console.log(new Date(createdAt.toDate()).toDateString());

    return <Card style={{ margin: 10 }}>
        <Card.Title title={user}
        // subtitle={createdAt.toDate().toDateString()}
        />
        <Card.Cover source={{ uri: image }} style={{ borderRadius: 0, height: 300, width: 300 }} />
        <Card.Content style={{ padding: 6 }}>
            <Text variant="bodyLarge">{title}</Text>
        </Card.Content>
        <View style={styles.iconContainer}>
            <Button
                icon={"heart"}
                onPress={likePost}>
                {likes}
            </Button>
            <Button
                icon="comment-outline">
                0
            </Button>
            <Button
                icon="share-variant">
                0
            </Button>
        </View>
    </Card>
}

const Feed = () => {

    const [feedArray, setFeedArray] = useState([]);

    const runOnce = useRef(true);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (runOnce.current) {
            fetchFeeds();
            runOnce.current = false
        }
    }, [])


    const fetchFeeds = () => {
        setLoading(true);
        const db = getFirestore(app);
        const ref = collection(db, "feeds");
        getDocs(ref).then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // console.log(data);
            setFeedArray(data);
            setLoading(false);
        });
    };

    return (
        <View style={styles.container}>
            <AddPost
                db={getFirestore(app)}
                fetchTodos={fetchFeeds}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                userName={randomUserNames[Math.floor(Math.random() * randomUserNames.length)]}
            />
            {
                feedArray.length === 0 ? <Text style={styles.feedTitle}>No Posts Yet</Text> : (
                    <FlatList
                        data={feedArray}
                        renderItem={({ item }) => <Post {...item} />}
                        keyExtractor={(item, index) => index}
                        refreshing={loading}
                        onRefresh={fetchFeeds}
                    />
                )
            }

            <FAB icon={'plus'} label='Add Post'
                onPress={() => setModalVisible(true)}
                style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // margin: 10,
    },
    feedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    feedImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        borderRadius: 10
    },
    iconContainer: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // width: '50%'
    }
});

export default Feed;