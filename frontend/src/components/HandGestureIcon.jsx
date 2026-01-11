import React from 'react';
import './HandGestureIcon.css';

// Visual hand gesture representations
const HandGestureIcon = ({ letter, size = 'medium' }) => {
  
  const getHandGesture = (letter) => {
    const gestures = {
      // Alphabet
      'A': { emoji: '✊', fingers: 'Fist', thumb: 'Side', description: 'Closed fist, thumb out' },
      'B': { emoji: '✋', fingers: 'All up', thumb: 'Side', description: 'Flat hand, fingers together' },
      'C': { emoji: '👌', fingers: 'Curved', thumb: 'Touch', description: 'C shape curved hand' },
      'D': { emoji: '☝️', fingers: 'One up', thumb: 'Circle', description: 'Index up, others down' },
      'E': { emoji: '✊', fingers: 'Curled', thumb: 'Across', description: 'Fingers bent, thumb over' },
      'F': { emoji: '👌', fingers: 'Three up', thumb: 'Touch', description: 'OK sign, 3 up' },
      'G': { emoji: '👈', fingers: 'Point side', thumb: 'Parallel', description: 'Index & thumb side' },
      'H': { emoji: '✌️', fingers: 'Two side', thumb: 'Down', description: 'Two fingers horizontal' },
      'I': { emoji: '🤙', fingers: 'Pinky up', thumb: 'Down', description: 'Pinky extended only' },
      'J': { emoji: '🤙', fingers: 'Pinky draw', thumb: 'Down', description: 'Pinky draws J' },
      'K': { emoji: '✌️', fingers: 'Two up', thumb: 'Between', description: 'Peace + thumb' },
      'L': { emoji: '👍', fingers: 'Index up', thumb: 'Side', description: 'L shape' },
      'M': { emoji: '✊', fingers: 'Three over', thumb: 'Under', description: '3 fingers over thumb' },
      'N': { emoji: '✊', fingers: 'Two over', thumb: 'Under', description: '2 fingers over thumb' },
      'O': { emoji: '👌', fingers: 'Circle', thumb: 'Touch', description: 'O circle shape' },
      'P': { emoji: '👇', fingers: 'K down', thumb: 'Between', description: 'K pointing down' },
      'Q': { emoji: '👇', fingers: 'G down', thumb: 'Down', description: 'G pointing down' },
      'R': { emoji: '🤞', fingers: 'Crossed', thumb: 'Down', description: 'Fingers crossed' },
      'S': { emoji: '✊', fingers: 'Closed', thumb: 'Front', description: 'Fist, thumb across' },
      'T': { emoji: '✊', fingers: 'Closed', thumb: 'Between', description: 'Thumb pokes through' },
      'U': { emoji: '✌️', fingers: 'Two together', thumb: 'Down', description: 'Two touching up' },
      'V': { emoji: '✌️', fingers: 'Two apart', thumb: 'Down', description: 'Victory/Peace sign' },
      'W': { emoji: '🖖', fingers: 'Three up', thumb: 'Down', description: 'Three fingers up' },
      'X': { emoji: '☝️', fingers: 'Hooked', thumb: 'Down', description: 'Index bent/hooked' },
      'Y': { emoji: '🤙', fingers: 'Thumb+pinky', thumb: 'Out', description: 'Hang loose sign' },
      'Z': { emoji: '☝️', fingers: 'Draw Z', thumb: 'Down', description: 'Index draws Z' },
      
      // Numbers
      '0': { emoji: '✊', fingers: 'All closed', thumb: 'Closed', description: 'Closed fist' },
      '1': { emoji: '☝️', fingers: 'Index only', thumb: 'Down', description: 'One finger up' },
      '2': { emoji: '✌️', fingers: 'Two up', thumb: 'Down', description: 'Two fingers up' },
      '3': { emoji: '🤟', fingers: 'Three up', thumb: 'Out', description: 'Thumb + 2 fingers' },
      '4': { emoji: '🖐️', fingers: 'Four up', thumb: 'Down', description: 'Four fingers up' },
      '5': { emoji: '🖐️', fingers: 'All spread', thumb: 'Out', description: 'All fingers open' },
      '6': { emoji: '🤙', fingers: 'Three up', thumb: 'Touch', description: 'Thumb touches pinky' },
      '7': { emoji: '🖖', fingers: 'Varied', thumb: 'Touch', description: 'Thumb touches ring' },
      '8': { emoji: '🖐️', fingers: 'Varied', thumb: 'Touch', description: 'Thumb touches middle' },
      '9': { emoji: '👌', fingers: 'Circle', thumb: 'Touch', description: 'Thumb touches index' },
      
      // Default
      'SPACE': { emoji: '⏸️', fingers: 'Pause', thumb: '-', description: 'Pause between words' }
    };
    
    return gestures[letter] || gestures['A'];
  };

  const gesture = getHandGesture(letter);
  const sizeClass = `hand-icon-${size}`;

  return (
    <div className={`hand-gesture-icon ${sizeClass}`}>
      <div className="hand-emoji">{gesture.emoji}</div>
      <div className="hand-details">
        <div className="finger-info">
          <span className="label">Fingers:</span>
          <span className="value">{gesture.fingers}</span>
        </div>
        <div className="thumb-info">
          <span className="label">Thumb:</span>
          <span className="value">{gesture.thumb}</span>
        </div>
      </div>
      <div className="gesture-description">{gesture.description}</div>
    </div>
  );
};

export default HandGestureIcon;



