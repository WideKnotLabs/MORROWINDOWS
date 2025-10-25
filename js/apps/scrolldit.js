// Scrolldit App - Reddit-like Social Platform

// Initialize Scrolldit app
function initScrolldit(windowId) {
    const contentElement = document.getElementById(`${windowId}-content`);
    if (!contentElement) return;

    // Create app content
    contentElement.innerHTML = `
        <div class="scrolldit-content">
            <div class="scrolldit-header">
                <div class="scrolldit-logo scrolldit-icon"></div>
                <div class="scrolldit-title">Scrolldit</div>
            </div>
            
            <div class="scrolldit-tabs">
                <div class="scrolldit-tab active" data-tab="posts">Posts</div>
                <div class="scrolldit-tab" data-tab="create">Create Post</div>
                <button class="scrolldit-refresh-btn" id="refresh-posts">
                    <span>↻</span> Refresh
                </button>
            </div>
            
            <div class="scrolldit-main">
                <div class="scrolldit-sidebar">
                    <h3 style="color: #F6D878; margin-bottom: 10px; font-family: 'Cinzel', serif;">Subscrolls</h3>
                    <ul class="scrolldit-subscroll-list" id="subscroll-list">
                        <!-- Subscrolls will be populated here -->
                    </ul>
                </div>
                
                <div class="scrolldit-posts" id="posts-container">
                    <!-- Posts will be populated here -->
                </div>
                
                <div class="scrolldit-new-post hidden" id="create-post-container">
                    <h3 style="color: #F6D878; margin-bottom: 10px; font-family: 'Cinzel', serif;">Create New Post</h3>
                    <div id="manual-post-form">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #F6D878; font-family: 'Cinzel', serif; font-size: 14px;">Select Subscroll:</label>
                            <select id="post-subscroll-select" class="scrolldit-subscroll-select" style="width: 100%; padding: 8px; background: #2c2416; border: 1px solid #4a3c2a; border-radius: 8px; color: #F5EDE0; font-family: 'Crimson Text', serif; font-size: 14px;">
                                <!-- Subscroll options will be populated here -->
                            </select>
                        </div>
                        <input type="text" class="scrolldit-new-post-title" id="new-post-title" placeholder="Post title...">
                        <textarea class="scrolldit-new-post-content" id="new-post-content" placeholder="Write your post content..."></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn" id="submit-post">Post</button>
                            <button class="btn btn-secondary" id="cancel-post">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize app functionality
    initScrollditFunctionality(windowId);
}

// Initialize Scrolldit functionality
function initScrollditFunctionality(windowId) {
    // Load data from localStorage or use defaults
    const scrollditData = loadScrollditData();

    // Populate subscrolls
    populateSubscrolls(scrollditData.subscrolls);

    // Populate posts
    populatePosts(scrollditData.posts);

    // Setup event listeners
    setupScrollditEventListeners(windowId, scrollditData);
}

// Load Scrolldit data from localStorage
function loadScrollditData() {
    const savedData = localStorage.getItem('scrolldit-data');
    if (savedData) {
        const data = JSON.parse(savedData);

        // Migrate old subscroll names to new Reddit-style names
        if (data.subscrolls) {
            const nameMap = {
                'General': 's/general',
                'Magic & Spells': 's/pells',
                'Quests & Adventures': 's/quests',
                'Lore & History': 's/lore',
                'Trading Post': 's/trading'
            };

            data.subscrolls = data.subscrolls.map(subscroll => {
                if (nameMap[subscroll.name]) {
                    return { ...subscroll, name: nameMap[subscroll.name] };
                }
                return subscroll;
            });

            // Update localStorage with migrated data
            localStorage.setItem('scrolldit-data', JSON.stringify(data));
        }

        return data;
    }

    // Default data
    return {
        subscrolls: [
            { id: 'general', name: 's/general', members: 1250 },
            { id: 'spells', name: 's/pells', members: 690 },
            { id: 'quests', name: 's/quests', members: 650 },
            { id: 'lore', name: 's/lore', members: 420 },
            { id: 'trading', name: 's/trading', members: 310 }
        ],
        posts: [
            {
                id: 1,
                subscrollId: 'general',
                author: 'Dragonborn',
                title: 'Welcome to Scrolldit!',
                content: 'This is a new platform for sharing knowledge and stories from across the realm. Feel free to share your adventures, spells, and wisdom!',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                upvotes: 42,
                comments: [
                    {
                        id: 1,
                        author: 'Mage',
                        content: 'Great initiative! Looking forward to sharing spell discoveries here.',
                        timestamp: new Date(Date.now() - 80000000).toISOString(),
                        parentId: null
                    },
                    {
                        id: 2,
                        author: 'Warrior',
                        content: 'Finally a place to share battle tactics!',
                        timestamp: new Date(Date.now() - 70000000).toISOString(),
                        parentId: null
                    },
                    {
                        id: 3,
                        author: 'Apprentice',
                        content: 'What kind of spells do you specialize in, Mage?',
                        timestamp: new Date(Date.now() - 60000000).toISOString(),
                        parentId: 1
                    },
                    {
                        id: 4,
                        author: 'Mage',
                        content: 'I specialize in elemental magic, particularly fire and ice spells. I\'ve been experimenting with combining them lately.',
                        timestamp: new Date(Date.now() - 50000000).toISOString(),
                        parentId: 3
                    }
                ]
            },
            {
                id: 2,
                subscrollId: 'spells',
                author: 'Archmage',
                title: 'New Discovery: Teleportation Spell Enhancement',
                content: 'After months of research, I\'ve found a way to reduce the mana cost of teleportation spells by 30%. The key is to channel energy through a crystal matrix during the incantation phase.',
                timestamp: new Date(Date.now() - 43200000).toISOString(),
                upvotes: 87,
                comments: [
                    {
                        id: 5,
                        author: 'Apprentice',
                        content: 'This is amazing! Can you share the exact crystal configuration?',
                        timestamp: new Date(Date.now() - 40000000).toISOString(),
                        parentId: null
                    },
                    {
                        id: 6,
                        author: 'Fellow Mage',
                        content: 'I\'ve been working on similar research. Have you considered using quartz crystals instead?',
                        timestamp: new Date(Date.now() - 30000000).toISOString(),
                        parentId: 5
                    }
                ]
            },
            {
                id: 3,
                subscrollId: 'quests',
                author: 'Adventurer',
                title: 'Dragon Slaying Quest - Looking for Party Members',
                content: 'I\'ve received a quest to defeat the ice dragon in the northern mountains. Need a healer and a ranger. Rewards include 500 gold coins and rare equipment.',
                timestamp: new Date(Date.now() - 21600000).toISOString(),
                upvotes: 23,
                comments: []
            }
        ]
    };
}

// Save Scrolldit data to localStorage
function saveScrollditData(data) {
    localStorage.setItem('scrolldit-data', JSON.stringify(data));
}

// Populate subscrolls in the sidebar
function populateSubscrolls(subscrolls) {
    const subscrollList = document.getElementById('subscroll-list');
    const postSubscrollSelect = document.getElementById('post-subscroll-select');

    if (!subscrollList) return;

    subscrollList.innerHTML = '';

    subscrolls.forEach(subscroll => {
        const li = document.createElement('li');
        li.className = 'scrolldit-subscroll-item';
        li.setAttribute('data-subscroll-id', subscroll.id);
        li.innerHTML = `
            <div>${subscroll.name}</div>
            <div style="font-size: 11px; opacity: 0.7;">${subscroll.members} members</div>
        `;

        li.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.scrolldit-subscroll-item').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked item
            li.classList.add('active');

            // Filter posts by subscroll
            filterPostsBySubscroll(subscroll.id);
        });

        subscrollList.appendChild(li);
    });

    // Set first subscroll as active
    if (subscrolls.length > 0) {
        subscrollList.querySelector('.scrolldit-subscroll-item').classList.add('active');
    }

    // Populate subscroll selector in post form
    if (postSubscrollSelect) {
        postSubscrollSelect.innerHTML = '';
        subscrolls.forEach(subscroll => {
            const option = document.createElement('option');
            option.value = subscroll.id;
            option.textContent = subscroll.name;
            postSubscrollSelect.appendChild(option);
        });

        // Set first subscroll as default
        postSubscrollSelect.value = subscrolls[0].id;
    }
}

// Populate posts in the main area
function populatePosts(posts, subscrollId = null) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    // Filter posts by subscroll if specified
    const filteredPosts = subscrollId
        ? posts.filter(post => post.subscrollId === subscrollId)
        : posts;

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = '<div style="text-align: center; color: #F5EDE0; padding: 20px;">No posts in this subscroll yet.</div>';
        return;
    }

    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'scrolldit-post';
    postDiv.setAttribute('data-post-id', post.id);

    const timeAgo = getTimeAgo(new Date(post.timestamp));

    postDiv.innerHTML = `
        <div class="scrolldit-post-header">
            <div class="scrolldit-post-avatar">${post.author.charAt(0).toUpperCase()}</div>
            <div class="scrolldit-post-info">
                <div class="scrolldit-post-author">${post.author}</div>
                <div class="scrolldit-post-time">${timeAgo}</div>
            </div>
        </div>
        <div class="scrolldit-post-title">${post.title}</div>
        <div class="scrolldit-post-content">${post.content}</div>
        <div class="scrolldit-post-actions">
            <div class="scrolldit-post-action" data-action="upvote">
                <span>▲</span> ${post.upvotes}
            </div>
            <div class="scrolldit-post-action" data-action="comment">
                <span>💬</span> ${post.comments.length}
            </div>
            <div class="scrolldit-post-action" data-action="share">
                <span>📤</span> Share
            </div>
            ${post.author === 'User' ? `
            <div class="scrolldit-post-action" data-action="delete" style="color: #ff6b6b;">
                <span>🗑</span> Delete
            </div>
            ` : ''}
        </div>
        <div class="scrolldit-comments hidden" id="comments-${post.id}">
            <div class="scrolldit-thread">
                ${organizeComments(post.comments).map(comment => createCommentHTML(comment, post.id)).join('')}
            </div>
            <div class="scrolldit-new-comment">
                <div class="manual-comment-form">
                    <input type="text" class="scrolldit-new-comment-input" placeholder="Write a comment..." data-post-id="${post.id}" data-parent-id="null">
                    <button class="btn" data-post-id="${post.id}">Post</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for post actions
    postDiv.querySelectorAll('.scrolldit-post-action').forEach(action => {
        action.addEventListener('click', (e) => {
            const actionType = e.currentTarget.getAttribute('data-action');
            handlePostAction(post.id, actionType);
        });
    });

    // Manual comment submission for main comment form
    const commentInputs = postDiv.querySelectorAll('.scrolldit-new-comment-input');

    commentInputs.forEach(commentInput => {
        const commentButton = commentInput.parentElement.querySelector('button:not(.cancel-reply)');

        if (commentButton) {
            commentButton.addEventListener('click', () => {
                const content = commentInput.value.trim();
                const postId = parseInt(commentInput.getAttribute('data-post-id'));
                const parentId = commentInput.getAttribute('data-parent-id');

                if (content && postId) {
                    submitComment(postId, content, parentId === 'null' ? null : parseInt(parentId));
                    commentInput.value = '';
                }
            });

            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const content = commentInput.value.trim();
                    const postId = parseInt(commentInput.getAttribute('data-post-id'));
                    const parentId = commentInput.getAttribute('data-parent-id');

                    if (content && postId) {
                        submitComment(postId, content, parentId === 'null' ? null : parseInt(parentId));
                        commentInput.value = '';
                    }
                }
            });
        }
    });

    // Attach listeners for dynamically created comment controls
    attachCommentListeners(postDiv, post.id);

    return postDiv;
}

function attachCommentListeners(rootElement, postId) {
    // Handle delete buttons
    rootElement.querySelectorAll(`.scrolldit-comment-delete[data-post-id="${postId}"]`).forEach(deleteBtn => {
        if (deleteBtn.dataset.listenerAttached === 'true') return;
        deleteBtn.dataset.listenerAttached = 'true';

        deleteBtn.addEventListener('click', (e) => {
            const targetPostId = e.currentTarget.getAttribute('data-post-id');
            const commentId = parseInt(e.currentTarget.getAttribute('data-comment-id'));
            deleteComment(targetPostId, commentId);
        });
    });

    // Handle reply buttons
    rootElement.querySelectorAll(`.scrolldit-comment-reply[data-post-id="${postId}"]`).forEach(replyBtn => {
        if (replyBtn.dataset.listenerAttached === 'true') return;
        replyBtn.dataset.listenerAttached = 'true';

        replyBtn.addEventListener('click', (e) => {
            const currentTarget = e.currentTarget;
            const targetPostId = parseInt(currentTarget.getAttribute('data-post-id'));
            const commentId = parseInt(currentTarget.getAttribute('data-comment-id'));
            const commentElement = currentTarget.closest('.scrolldit-comment');

            if (!commentElement) return;

            const commentBody = commentElement.querySelector('.scrolldit-comment-body');
            if (!commentBody) return;

            let replyForm = commentBody.querySelector(`.scrolldit-reply-form[data-parent-id="${commentId}"]`);
            if (replyForm) {
                replyForm.classList.toggle('hidden');
                const existingInput = replyForm.querySelector('.scrolldit-new-comment-input');
                if (existingInput && !replyForm.classList.contains('hidden')) {
                    existingInput.focus();
                }
                return;
            }

            replyForm = document.createElement('div');
            replyForm.className = 'scrolldit-reply-form';
            replyForm.setAttribute('data-parent-id', commentId);
            replyForm.innerHTML = `
                <div class="scrolldit-new-comment">
                    <div class="manual-comment-form">
                        <input type="text" class="scrolldit-new-comment-input" placeholder="Write a reply..." data-post-id="${targetPostId}" data-parent-id="${commentId}">
                        <button class="btn" data-post-id="${targetPostId}">Reply</button>
                        <button class="btn btn-secondary cancel-reply">Cancel</button>
                    </div>
                </div>
            `;

            commentBody.appendChild(replyForm);

            const replyInput = replyForm.querySelector('.scrolldit-new-comment-input');
            const replyButton = replyForm.querySelector('.manual-comment-form .btn:not(.btn-secondary)');
            const cancelButton = replyForm.querySelector('.cancel-reply');

            if (!replyInput || !replyButton || !cancelButton) {
                replyForm.remove();
                return;
            }

            const submitReply = () => {
                const content = replyInput.value.trim();
                if (!content) return;
                submitComment(targetPostId, content, commentId);
                replyForm.remove();
            };

            replyButton.addEventListener('click', submitReply);
            replyInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitReply();
                }
            });
            cancelButton.addEventListener('click', () => replyForm.remove());

            replyInput.focus();
        });
    });
}

// Organize comments into a threaded structure
function organizeComments(comments) {
    const commentMap = {};
    const rootComments = [];

    // Create a map of all comments
    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Organize comments into threads
    comments.forEach(comment => {
        if (comment.parentId === null || comment.parentId === undefined) {
            rootComments.push(commentMap[comment.id]);
        } else {
            const parent = commentMap[comment.parentId];
            if (parent) {
                parent.replies.push(commentMap[comment.id]);
            } else {
                // If parent not found, treat as root comment
                rootComments.push(commentMap[comment.id]);
            }
        }
    });

    return rootComments;
}

// Create comment HTML with threading support
function createCommentHTML(comment, postId, depth = 0) {
    const timeAgo = getTimeAgo(new Date(comment.timestamp));
    const repliesHTML = comment.replies && comment.replies.length > 0
        ? `<div class="scrolldit-comment-replies">
                ${comment.replies.map(reply => createCommentHTML(reply, postId, depth + 1)).join('')}
           </div>`
        : '';

    return `
        <article class="scrolldit-comment" data-comment-id="${comment.id}" data-depth="${depth}">
            <div class="scrolldit-comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
            <div class="scrolldit-comment-body">
                <div class="scrolldit-comment-content">
                    <div class="scrolldit-comment-author">
                        <span class="scrolldit-comment-author-name">${comment.author}</span>
                        <span class="scrolldit-comment-time">${timeAgo}</span>
                        <span class="scrolldit-comment-reply" data-post-id="${postId}" data-comment-id="${comment.id}">💬 Reply</span>
                        ${comment.author === 'User' ? `
                        <span class="scrolldit-comment-delete" data-post-id="${postId}" data-comment-id="${comment.id}">🗑 Delete</span>
                        ` : ''}
                    </div>
                    <div class="scrolldit-comment-text">${comment.content}</div>
                </div>
                ${repliesHTML}
            </div>
        </article>
    `;
}

function refreshComments(postId) {
    const scrollditData = loadScrollditData();
    const post = scrollditData.posts.find(p => p.id === postId);
    if (!post) return;

    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (!commentsContainer) return;

    // Clear existing comments
    const commentElements = commentsContainer.querySelectorAll('.scrolldit-comment');
    commentElements.forEach(el => el.remove());

    // Re-render comments
    const organizedComments = organizeComments(post.comments);
    const commentsHTML = organizedComments.map(comment => createCommentHTML(comment, postId)).join('');

    // Insert new comments before the new comment form
    const newCommentForm = commentsContainer.querySelector('.scrolldit-new-comment');
    if (newCommentForm) {
        // Check if thread container exists, if not create it
        let threadContainer = commentsContainer.querySelector('.scrolldit-thread');
        if (!threadContainer) {
            threadContainer = document.createElement('div');
            threadContainer.className = 'scrolldit-thread';
            newCommentForm.insertAdjacentElement('beforebegin', threadContainer);
        }
        threadContainer.innerHTML = commentsHTML;

        // Reattach comment interaction handlers after re-render
        attachCommentListeners(commentsContainer, postId);
    }

    // Update comment count
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        const commentCountElement = postElement.querySelector('[data-action="comment"]');
        if (commentCountElement) {
            commentCountElement.innerHTML = `<span>💬</span> ${post.comments.length}`;
        }
    }
}

// Handle post actions
function handlePostAction(postId, action) {
    const scrollditData = loadScrollditData();
    const post = scrollditData.posts.find(p => p.id === postId);

    if (!post) return;

    switch (action) {
        case 'upvote':
            post.upvotes += 1;
            saveScrollditData(scrollditData);
            // Refresh posts to update upvote count
            const activeSubscroll = document.querySelector('.scrolldit-subscroll-item.active');
            const subscrollId = activeSubscroll ? activeSubscroll.getAttribute('data-subscroll-id') : null;
            populatePosts(scrollditData.posts, subscrollId);
            break;

        case 'comment':
            const commentsContainer = document.getElementById(`comments-${postId}`);
            if (commentsContainer) {
                commentsContainer.classList.toggle('hidden');
            }
            break;

        case 'share':
            if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                window.MorrowindOS.showNotification(
                    'Post Shared',
                    'Post link copied to clipboard!',
                    'success'
                );
            }
            break;

        case 'delete':
            // Only allow users to delete their own posts
            if (post.author === 'User') {
                // Confirm deletion
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Delete Post',
                        'Are you sure you want to delete this post?',
                        'warning',
                        true, // Show confirm buttons
                        () => {
                            // Delete the post
                            const postIndex = scrollditData.posts.findIndex(p => p.id === postId);
                            if (postIndex !== -1) {
                                scrollditData.posts.splice(postIndex, 1);
                                saveScrollditData(scrollditData);

                                // Refresh posts
                                const activeSubscroll = document.querySelector('.scrolldit-subscroll-item.active');
                                const subscrollId = activeSubscroll ? activeSubscroll.getAttribute('data-subscroll-id') : null;
                                populatePosts(scrollditData.posts, subscrollId);

                                // Show success notification
                                window.MorrowindOS.showNotification(
                                    'Post Deleted',
                                    'Your post has been deleted.',
                                    'success'
                                );
                            }
                        }
                    );
                }
            } else {
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Cannot Delete',
                        'You can only delete your own posts.',
                        'error'
                    );
                }
            }
            break;
    }
}

// Submit a new comment or reply
async function submitComment(postId, content, parentId = null) {
    const scrollditData = loadScrollditData();
    const post = scrollditData.posts.find(p => p.id === postId);

    if (!post) return;

    const newComment = {
        id: Date.now(),
        author: 'User', // In a real app, this would be the logged-in user
        content: content,
        timestamp: new Date().toISOString(),
        parentId: parentId
    };

    post.comments.push(newComment);
    saveScrollditData(scrollditData);

    // Refresh comments for the post
    refreshComments(postId);

    // Reopen comments for this post
    setTimeout(() => {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        if (commentsContainer) {
            commentsContainer.classList.remove('hidden');
        }
    }, 100);

    // Generate AI reply to the comment
    try {
        // Show loading notification
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Generating Reply',
                'AI is crafting a response to your comment...',
                'info'
            );
        }

        // Select a random character to reply (different from the post author if possible)
        const characters = [
            'Archmage Theron', 'Captain Valerius', 'Shadowmere',
            'Merchant Guildmaster', 'Loremaster Elara', 'Apprentice Finn',
            'Elder Sage', 'Battle Priest', 'Alchemist', 'Ranger'
        ];

        // Filter out the post author if it's one of the characters
        let availableCharacters = characters;
        if (characters.includes(post.author)) {
            availableCharacters = characters.filter(c => c !== post.author);
        }

        const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];

        // Get comment thread for context
        const threadComments = post.comments.filter(c =>
            c.parentId === newComment.parentId ||
            c.id === newComment.parentId ||
            c.parentId === null
        ).slice(-5); // Get last 5 relevant comments

        // Generate AI reply with thread context
        const aiReply = await OpenAIService.generateCharacterReply(
            `${post.title}\n\n${post.content}`,
            content,
            randomCharacter,
            post.title,
            post.subscrollId,
            threadComments
        );

        // Add AI comment to the post
        const aiComment = {
            id: Date.now() + 1,
            author: randomCharacter,
            content: aiReply,
            timestamp: new Date().toISOString(),
            parentId: newComment.id // Thread the AI reply to the new user comment
        };

        // Find the post and add the comment
        const postIndex = scrollditData.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            scrollditData.posts[postIndex].comments.push(aiComment);
            saveScrollditData(scrollditData);

            // Refresh comments for the post
            refreshComments(postId);

            // Reopen comments for this post
            setTimeout(() => {
                const commentsContainer = document.getElementById(`comments-${postId}`);
                if (commentsContainer) {
                    commentsContainer.classList.remove('hidden');
                }
            }, 100);

            // Show success notification
            if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                window.MorrowindOS.showNotification(
                    'Reply Generated',
                    `${randomCharacter} replied to your comment!`,
                    'success'
                );
            }
        }
    } catch (error) {
        console.error('Error generating AI reply:', error);

        // Show error notification
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Error',
                'Failed to generate AI reply. Please check your API key.',
                'error'
            );
        }
    }
}

// Delete a comment
function deleteComment(postId, commentId) {
    const scrollditData = loadScrollditData();
    const post = scrollditData.posts.find(p => p.id === parseInt(postId));

    if (!post) return;

    // Find the comment index
    const commentIndex = post.comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) return;

    // Check if the comment is by the User
    const comment = post.comments[commentIndex];
    if (comment.author !== 'User') {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Cannot Delete',
                'You can only delete your own comments.',
                'error'
            );
        }
        return;
    }

    // Confirm deletion
    if (window.MorrowindOS && window.MorrowindOS.showNotification) {
        window.MorrowindOS.showNotification(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            'warning',
            true, // Show confirm buttons
            () => {
                // Delete the comment
                post.comments.splice(commentIndex, 1);
                saveScrollditData(scrollditData);

                // Refresh comments for the post
                refreshComments(postId);

                // Reopen comments for this post
                setTimeout(() => {
                    const commentsContainer = document.getElementById(`comments-${postId}`);
                    if (commentsContainer) {
                        commentsContainer.classList.remove('hidden');
                    }
                }, 100);

                // Show success notification
                window.MorrowindOS.showNotification(
                    'Comment Deleted',
                    'Your comment has been deleted.',
                    'success'
                );
            }
        );
    }
}

// Filter posts by subscroll
function filterPostsBySubscroll(subscrollId) {
    const scrollditData = loadScrollditData();
    populatePosts(scrollditData.posts, subscrollId);
}

// Setup event listeners for Scrolldit
function setupScrollditEventListeners(windowId, scrollditData) {
    // Tab switching
    document.querySelectorAll('.scrolldit-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.scrolldit-tab').forEach(t => {
                t.classList.remove('active');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            const tabName = tab.getAttribute('data-tab');

            // Show/hide appropriate containers
            const postsContainer = document.getElementById('posts-container');
            const createPostContainer = document.getElementById('create-post-container');

            if (tabName === 'posts') {
                postsContainer.classList.remove('hidden');
                createPostContainer.classList.add('hidden');
            } else if (tabName === 'create') {
                postsContainer.classList.add('hidden');
                createPostContainer.classList.remove('hidden');
            }
        });
    });

    // Refresh button
    const refreshBtn = document.getElementById('refresh-posts');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // Show loading notification
            if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                window.MorrowindOS.showNotification(
                    'Refreshing',
                    'Looking into the Abyss for new Posts...',
                    'info'
                );
            }

            // Get active subscroll
            const activeSubscroll = document.querySelector('.scrolldit-subscroll-item.active');
            const subscrollId = activeSubscroll ? activeSubscroll.getAttribute('data-subscroll-id') : 'general';

            try {
                // Generate new AI post with comments
                const newPost = await OpenAIService.generateScrollditPost(subscrollId);

                // Add the new post to the data
                newPost.id = Date.now();
                newPost.timestamp = new Date().toISOString();

                // Ensure comments have proper IDs and timestamps
                if (newPost.comments && Array.isArray(newPost.comments)) {
                    newPost.comments = newPost.comments.map((comment, index) => ({
                        id: Date.now() + index,
                        author: comment.author || 'Anonymous',
                        content: comment.content,
                        timestamp: new Date().toISOString()
                    }));
                } else {
                    newPost.comments = [];
                }

                scrollditData.posts.unshift(newPost);
                saveScrollditData(scrollditData);

                // Reload posts
                populatePosts(scrollditData.posts, subscrollId);

                // Show success notification
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Refresh Complete',
                        'New AI-generated post added!',
                        'success'
                    );
                }
            } catch (error) {
                console.error('Error generating AI post:', error);

                // Show error notification
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Error',
                        'Failed to generate AI post. Please check your API key.',
                        'error'
                    );
                }

                // Fallback to just reloading existing posts
                populatePosts(scrollditData.posts, subscrollId);
            }
        });
    }

    // Submit new post
    const submitPostBtn = document.getElementById('submit-post');
    const cancelPostBtn = document.getElementById('cancel-post');
    const newPostTitle = document.getElementById('new-post-title');
    const newPostContent = document.getElementById('new-post-content');

    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', async () => {
            const title = newPostTitle.value.trim();
            const content = newPostContent.value.trim();

            if (!title || !content) {
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Error',
                        'Please fill in both title and content.',
                        'error'
                    );
                }
                return;
            }

            // Get selected subscroll from dropdown
            const postSubscrollSelect = document.getElementById('post-subscroll-select');
            const subscrollId = postSubscrollSelect ? postSubscrollSelect.value : 'general';

            // Create new post
            const newPost = {
                id: Date.now(),
                subscrollId: subscrollId,
                author: 'User', // In a real app, this would be the logged-in user
                title: title,
                content: content,
                timestamp: new Date().toISOString(),
                upvotes: 0,
                comments: []
            };

            // Add to data
            scrollditData.posts.unshift(newPost);
            saveScrollditData(scrollditData);

            // Clear form
            newPostTitle.value = '';
            newPostContent.value = '';

            // Switch to posts tab
            document.querySelector('.scrolldit-tab[data-tab="posts"]').click();

            // Show notification
            if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                window.MorrowindOS.showNotification(
                    'Post Created',
                    'Your post has been published!',
                    'success'
                );
            }

            // Generate AI reply to the post
            try {
                // Show loading notification
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Generating Reply',
                        'AI is crafting a response to your post...',
                        'info'
                    );
                }

                // Select a random character to reply
                const characters = [
                    'Archmage Theron', 'Captain Valerius', 'Shadowmere',
                    'Merchant Guildmaster', 'Loremaster Elara', 'Apprentice Finn',
                    'Elder Sage', 'Battle Priest', 'Alchemist', 'Ranger'
                ];
                const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

                // Generate AI reply with empty thread context (new post)
                const aiReply = await OpenAIService.generateCharacterReply(
                    `${title}\n\n${content}`,
                    '',
                    randomCharacter,
                    title,
                    subscrollId,
                    [] // Empty thread for new posts
                );

                // Add AI comment to the post
                const aiComment = {
                    id: Date.now() + 1,
                    author: randomCharacter,
                    content: aiReply,
                    timestamp: new Date().toISOString(),
                    parentId: null // AI replies to posts are top-level comments
                };

                // Find the post and add the comment
                const postIndex = scrollditData.posts.findIndex(p => p.id === newPost.id);
                if (postIndex !== -1) {
                    scrollditData.posts[postIndex].comments.push(aiComment);
                    saveScrollditData(scrollditData);

                    // Refresh posts to show the AI reply
                    const activeSubscroll = document.querySelector('.scrolldit-subscroll-item.active');
                    const currentSubscrollId = activeSubscroll ? activeSubscroll.getAttribute('data-subscroll-id') : null;
                    populatePosts(scrollditData.posts, currentSubscrollId);

                    // Open comments for this post
                    setTimeout(() => {
                        const commentsContainer = document.getElementById(`comments-${newPost.id}`);
                        if (commentsContainer) {
                            commentsContainer.classList.remove('hidden');
                        }
                    }, 100);

                    // Show success notification
                    if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                        window.MorrowindOS.showNotification(
                            'Reply Generated',
                            `${randomCharacter} replied to your post!`,
                            'success'
                        );
                    }
                }
            } catch (error) {
                console.error('Error generating AI reply:', error);

                // Show error notification
                if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                    window.MorrowindOS.showNotification(
                        'Error',
                        'Failed to generate AI reply. Please check your API key.',
                        'error'
                    );
                }
            }
        });
    }

    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', () => {
            // Clear form
            newPostTitle.value = '';
            newPostContent.value = '';

            // Switch to posts tab
            document.querySelector('.scrolldit-tab[data-tab="posts"]').click();
        });
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }

    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }

    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }

    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }

    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }

    return Math.floor(seconds) + " seconds ago";
}

// Register the app initialization function
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.scrolldit = initScrolldit;
