// import { useEffect, useRef, useState, useCallback } from 'react';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';

// export const useWebSocket = (url, onMessage, onNotification) => {
//     const [connected, setConnected] = useState(false);
//     const stompClient = useRef(null);
//     const onMessageRef = useRef(onMessage);
//     const onNotificationRef = useRef(onNotification);
    
//     // Обновляем refs при изменении колбэков
//     useEffect(() => {
//         onMessageRef.current = onMessage;
//         onNotificationRef.current = onNotification;
//     }, [onMessage, onNotification]);
    
//     useEffect(() => {
//         // Предотвращаем множественное подключение
//         if (stompClient.current && stompClient.current.connected) {
//             return;
//         }
        
//         const client = new Client({
//             webSocketFactory: () => new SockJS(url),
//             debug: () => {},
//             reconnectDelay: 5000,
//             onConnect: () => {
//                 console.log('✅ WebSocket подключен');
//                 setConnected(true);
                
//                 // Подписка на личные сообщения
//                 client.subscribe('/user/queue/messages', (message) => {
//                     try {
//                         const msg = JSON.parse(message.body);
//                         if (onMessageRef.current) onMessageRef.current(msg);
//                     } catch (e) {
//                         console.error('Ошибка парсинга сообщения:', e);
//                     }
//                 });
                
//                 // Подписка на уведомления
//                 client.subscribe('/user/queue/notifications', (message) => {
//                     try {
//                         const notif = JSON.parse(message.body);
//                         if (onNotificationRef.current) onNotificationRef.current(notif);
//                     } catch (e) {
//                         console.error('Ошибка парсинга уведомления:', e);
//                     }
//                 });
//             },
//             onStompError: (frame) => {
//                 console.error('❌ STOMP ошибка:', frame);
//                 setConnected(false);
//             },
//             onWebSocketError: (error) => {
//                 console.error('❌ WebSocket ошибка:', error);
//                 setConnected(false);
//             },
//             onDisconnect: () => {
//                 console.log('WebSocket отключён');
//                 setConnected(false);
//             },
//         });
        
//         client.activate();
//         stompClient.current = client;
        
//         return () => {
//             if (stompClient.current) {
//                 stompClient.current.deactivate();
//                 stompClient.current = null;
//             }
//         };
//     }, [url]); // только url как зависимость
    
//     const sendMessage = useCallback((chatId, content) => {
//         if (stompClient.current && stompClient.current.connected) {
//             stompClient.current.publish({
//                 destination: `/app/chat/${chatId}/send`,
//                 body: content
//             });
//             return true;
//         }
//         return false;
//     }, []);
    
//     return { connected, sendMessage };
// };


import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useWebSocket = (url, onMessage, onNotification) => {
    const [connected, setConnected] = useState(false);
    const stompClient = useRef(null);
    const onMessageRef = useRef(onMessage);
    const onNotificationRef = useRef(onNotification);
    const subscriptionsRef = useRef({});
    
    useEffect(() => {
        onMessageRef.current = onMessage;
        onNotificationRef.current = onNotification;
    }, [onMessage, onNotification]);
    
    useEffect(() => {
        if (stompClient.current && stompClient.current.connected) {
            return;
        }
        
        const client = new Client({
            webSocketFactory: () => new SockJS(url),
            debug: () => {},
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('✅ WebSocket подключен');
                setConnected(true);
                
                // Подписка на личные уведомления
                client.subscribe('/user/queue/notifications', (message) => {
                    try {
                        const notif = JSON.parse(message.body);
                        if (onNotificationRef.current) onNotificationRef.current(notif);
                    } catch (e) {
                        console.error('Ошибка парсинга уведомления:', e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ STOMP ошибка:', frame);
                setConnected(false);
            },
            onWebSocketError: (error) => {
                console.error('❌ WebSocket ошибка:', error);
                setConnected(false);
            },
            onDisconnect: () => {
                console.log('WebSocket отключён');
                setConnected(false);
            },
        });
        
        client.activate();
        stompClient.current = client;
        
        return () => {
            // Отписываемся от всех чатов
            Object.keys(subscriptionsRef.current).forEach(chatId => {
                if (subscriptionsRef.current[chatId]) {
                    subscriptionsRef.current[chatId].unsubscribe();
                }
            });
            if (stompClient.current) {
                stompClient.current.deactivate();
                stompClient.current = null;
            }
        };
    }, [url]);
    
    // Метод для подписки на конкретный чат
    const subscribeToChat = useCallback((chatId) => {
        if (!stompClient.current || !stompClient.current.connected) {
            console.log('WebSocket не подключен, ждём...');
            // Подождём подключения
            const checkInterval = setInterval(() => {
                if (stompClient.current && stompClient.current.connected) {
                    clearInterval(checkInterval);
                    subscribeToChat(chatId);
                }
            }, 500);
            return;
        }
        
        // Если уже подписаны, отписываемся
        if (subscriptionsRef.current[chatId]) {
            subscriptionsRef.current[chatId].unsubscribe();
        }
        
        console.log(`Подписка на чат ${chatId}`);
        const subscription = stompClient.current.subscribe(`/topic/chat/${chatId}`, (message) => {
            try {
                const msg = JSON.parse(message.body);
                console.log('📩 Получено сообщение:', msg);
                if (onMessageRef.current) onMessageRef.current(msg);
            } catch (e) {
                console.error('Ошибка парсинга сообщения:', e);
            }
        });
        
        subscriptionsRef.current[chatId] = subscription;
    }, []);
    
    const sendMessage = useCallback((chatId, content) => {
        if (stompClient.current && stompClient.current.connected) {
            stompClient.current.publish({
                destination: `/app/chat/${chatId}/send`,
                body: content
            });
            return true;
        }
        return false;
    }, []);
    
    return { connected, sendMessage, subscribeToChat };
};