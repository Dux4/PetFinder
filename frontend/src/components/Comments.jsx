// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';

// const Comments = ({ announcementId, ownerId }) => {
//   const { user } = useAuth();
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     console.log('Comments - useEffect executado com announcementId:', announcementId);
//     if (announcementId) {
//       fetchComments();
//     }
//   }, [announcementId]);

//   const fetchComments = async () => {
//     console.log('fetchComments - Iniciando busca para announcement:', announcementId);
//     try {
//       const response = await fetch(`http://localhost:3000/api/comments/${announcementId}`);
//       console.log('fetchComments - Response status:', response.status);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('fetchComments - Dados recebidos:', data);
//         setComments(data);
//         setError('');
//       } else {
//         const errorData = await response.text();
//         console.error('fetchComments - Erro na resposta:', errorData);
//         setError('Erro ao carregar comentários');
//       }
//     } catch (error) {
//       console.error('fetchComments - Erro na requisição:', error);
//       setError('Erro ao carregar comentários');
//     }
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
    
//     console.log('handleSubmit - Iniciando envio do comentário');
//     console.log('handleSubmit - newComment:', newComment);
//     console.log('handleSubmit - user:', user);
//     console.log('handleSubmit - announcementId:', announcementId);
    
//     if (!newComment.trim()) {
//       console.log('handleSubmit - Comentário vazio, abortando');
//       return;
//     }
    
//     if (!user) {
//       console.log('handleSubmit - Usuário não logado, abortando');
//       setError('Você precisa estar logado para comentar');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
//       console.log('handleSubmit - Token encontrado:', !!token);
      
//       const requestBody = {
//         announcement_id: announcementId,
//         content: newComment.trim()
//       };
      
//       console.log('handleSubmit - Dados a serem enviados:', requestBody);
      
//       const response = await fetch('http://localhost:3000/api/comments', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(requestBody)
//       });

//       console.log('handleSubmit - Response status:', response.status);
      
//       if (response.ok) {
//         const responseData = await response.json();
//         console.log('handleSubmit - Comentário criado com sucesso:', responseData);
//         setNewComment('');
//         await fetchComments(); // Recarregar comentários
//         setError('');
//       } else {
//         const errorData = await response.text();
//         console.error('handleSubmit - Erro na resposta:', errorData);
//         setError('Erro ao enviar comentário');
//       }
//     } catch (error) {
//       console.error('handleSubmit - Erro na requisição:', error);
//       setError('Erro ao enviar comentário');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-gray-200">
//       <h4 className="font-semibold text-gray-800 mb-3">💬 Comentários ({comments.length})</h4>
      
//       {/* Mostrar erros se houver */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
//           {error}
//         </div>
//       )}
      
//       {/* Form de novo comentário */}
//       {user ? (
//         <div className="mb-4">
//           <textarea
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Escreva um comentário..."
//             className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             rows="3"
//             disabled={loading}
//           />
//           <div className="flex justify-between items-center mt-2">
//             <span className="text-xs text-gray-500">
//               Pressione Enter para enviar, Shift+Enter para nova linha
//             </span>
//             <button
//               onClick={handleSubmit}
//               disabled={loading || !newComment.trim()}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? 'Enviando...' : 'Comentar'}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
//           Faça login para comentar.
//         </div>
//       )}

//       {/* Lista de comentários */}
//       <div className="space-y-3 max-h-60 overflow-y-auto">
//         {comments.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
//         ) : (
//           comments.map(comment => {
//             console.log('Renderizando comentário:', comment);
//             return (
//               <div
//                 key={comment.id}
//                 className={`p-3 rounded-lg text-sm ${
//                   comment.user_id === ownerId 
//                     ? 'bg-blue-50 border border-blue-200' 
//                     : 'bg-gray-50'
//                 }`}
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <span className={`font-medium ${
//                     comment.user_id === ownerId ? 'text-blue-700' : 'text-gray-700'
//                   }`}>
//                     {comment.user?.name || 'Usuário desconhecido'}
//                     {comment.user_id === ownerId && (
//                       <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
//                         Dono
//                       </span>
//                     )}
//                   </span>
//                   <span className="text-xs text-gray-500">
//                     {new Date(comment.created_at).toLocaleDateString('pt-BR', {
//                       day: '2-digit',
//                       month: '2-digit',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </span>
//                 </div>
//                 <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default Comments;