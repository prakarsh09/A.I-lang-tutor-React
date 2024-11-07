import React, { useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Box,
  Button,
  Card,
  CircularProgress,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MicIcon from '@mui/icons-material/Mic';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const recorder = new MicRecorder({ bitRate: 128 });

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcription, setTranscription] = useState('');
  const [generatedString, setGeneratedString] = useState('');
  const [result, setResult] = useState('');
  const [language, setLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#ff4081' },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const startRecording = () => {
    recorder.start()
      .then(() => setRecording(true))
      .catch((e) => console.error('Recording start error:', e));
  };

  const pauseRecording = () => {
    recorder.pause()
      .then(() => setPaused(true))
      .catch((e) => console.error('Pause error:', e));
  };

  const resumeRecording = () => {
    recorder.resume()
      .then(() => setPaused(false))
      .catch((e) => console.error('Resume error:', e));
  };

  const stopRecording = () => {
    recorder.stop().getMp3().then(([buffer, blob]) => {
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
      setRecording(false);
      setPaused(false);

      const formData = new FormData();
      formData.append('file', blob, 'audio.mp3');

      axios.post('http://localhost:5000/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => setTranscription(response.data))
      .catch(error => console.error('Error sending audio to backend:', error));
    });
  };

  const clearRecording = () => {
    setAudioUrl('');
    setTranscription('');
    setResult('');
  };

  const generateString = () => {
    axios.get('http://localhost:5000/generate', {
      params: { language }
    })
    .then(response => setGeneratedString(response.data))
    .catch(error => console.error('Error generating string:', error));
  };

  const checkResult = () => {
    if (!transcription || !generatedString) {
      console.warn('Transcription or generated text is missing');
      return;
    }

    axios.get('http://localhost:5000/ask', {
      params: {
        gen: generatedString,
        trans: transcription,
        language,
        targetLanguage,
      }
    })
    .then(response => setResult(response.data))
    .catch(error => console.error('Error checking result:', error));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">A.I Language Test</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl variant="outlined" size="small">
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                displayEmpty
                style={{ minWidth: 100 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>

            {/* Arrow Icon */}
            <ArrowForwardIcon />

            <FormControl variant="outlined" size="small">
              <Select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                displayEmpty
                style={{ minWidth: 100 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>

            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh" bgcolor="background.default">
        <Card sx={{ padding: 4, maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3, textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={generateString} sx={{ mb: 2 }}>
            Generate
          </Button>
          {generatedString && <Typography variant="body1" color="text.secondary">Generated: {generatedString}</Typography>}

          <Box mt={3} display="flex" justifyContent="center" alignItems="center">
            <IconButton color="primary" onClick={recording ? stopRecording : startRecording} size="large">
              {recording ? <StopIcon fontSize="large" /> : <MicIcon fontSize="large" />}
            </IconButton>

            {recording && (
              <IconButton color="secondary" onClick={paused ? resumeRecording : pauseRecording}>
                {paused ? <MicIcon fontSize="large" /> : <PauseIcon fontSize="large" />}
              </IconButton>
            )}
          </Box>

          {recording && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <CircularProgress size={30} sx={{ color: 'secondary.main' }} />
              <Typography variant="caption" color="text.secondary" ml={1}>Recording...</Typography>
            </Box>
          )}

          {audioUrl && (
            <Box mt={3}>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
            </Box>
          )}

          {transcription && (
            <Typography variant="body1" color="text.secondary" mt={2}>
              Transcription: {transcription}
            </Typography>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={checkResult}
            disabled={!transcription || !generatedString}
            sx={{ mt: 2 }}
          >
            Check Result
          </Button>
          {result && <Typography variant="body1" color="text.secondary" mt={2}>Result: {result}</Typography>}

          <Button variant="outlined" color="error" onClick={clearRecording} sx={{ mt: 2 }}>
            Clear
          </Button>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default AudioRecorder;
