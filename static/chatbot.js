import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

async function initialize() {

    let answerer; 
    let model;
    let documents = [];

    async function loadPipeline() {
        answerer = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
        console.log('Pipeline loaded');
    }

    // Load the Universal Sentence Encoder model
    async function loadModel() {
        model = await use.load();
        console.log('Model loaded');
    }

    // Initialize the chatbot
    async function init() {
        try {
            await Promise.all([loadPipeline(), loadModel(), loadDocuments()]);
            console.log('Chatbot initialized');
            document.getElementById('send-btn').disabled = false;
            document.getElementById('user-input').disabled = false;
        } catch (error) {
            console.error('Error initializing chatbot:', error);
            addMessageToChat('System', 'An error occurred while initializing the chatbot. Please try refreshing the page.');
        }
    }

    // Load documents from the Markdown files
    async function loadDocuments() {
        try {
            const response = await fetch('index.json');
            const data = await response.json();
            documents = data.files.map(file => ({
                title: file.title,
                content: file.content,
                labels: file.labels
            }));
            console.log('Documents loaded:', documents.length);
        } catch (error) {
            console.error('Error loading documents:', error);
            throw error;
        }
    }

    // Embed text using the Universal Sentence Encoder
    async function embedText(text) {
        const embeddings = await model.embed([text]);
        return embeddings.arraySync()[0];
    }

    // Perform retrieval
    async function retrieve(query, k = 3) {
        const queryEmbedding = await embedText(query);
        const scores = await Promise.all(documents.map(async (doc) => {
            const docEmbedding = await embedText(doc.content);
            return {
                score: cosineSimilarity(queryEmbedding, docEmbedding),
                doc: doc
            };
        }));
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(item => item.doc);
    }

    // Simple cosine similarity implementation
    function cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    // Generate a response based on retrieved documents
    async function generate(retrievedDocs, query) {
        const relevantInfo = retrievedDocs.map(doc => `${doc.title}: ${doc.content.substring(0, 100)}...`).join('\n');
        const output = await answerer(query, relevantInfo);
        console.log(output.answer);

        return `Based on the relevant information, here's a response to "${query}":\n\n${output.answer}`;
    }

    // Handle user input
    async function handleUserInput() {
        const userInput = document.getElementById('user-input').value;
        if (userInput.trim() === '') return;

        addMessageToChat('User', userInput);
        document.getElementById('user-input').value = '';
        document.getElementById('send-btn').disabled = true;

        try {
            const retrievedDocs = await retrieve(userInput);
            const response = await generate(retrievedDocs, userInput);
            addMessageToChat('Bot', response);
        } catch (error) {
            console.error('Error processing user input:', error);
            addMessageToChat('System', 'An error occurred while processing your request. Please try again.');
        } finally {
            document.getElementById('send-btn').disabled = false;
        }
    }

    // Add a message to the chat container
    function addMessageToChat(sender, message) {
        const chatContainer = document.getElementById('chat-container');
        const messageElement = document.createElement('div');
        messageElement.className = `mb-2 p-2 rounded ${sender === 'User' ? 'text-right bg-blue-100 dark:bg-blue-900' : 'text-left bg-gray-100 dark:bg-gray-800'}`;
        messageElement.innerHTML = `<strong class="text-gray-900 dark:text-gray-100">${sender}:</strong> <span class="text-gray-800 dark:text-gray-200">${message}</span>`;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', () => {
        init();
        document.getElementById('send-btn').addEventListener('click', handleUserInput);
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput();
        });
    });

}
initialize();