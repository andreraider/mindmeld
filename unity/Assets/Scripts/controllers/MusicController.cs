using System;
using UnityEngine;

namespace controllers
{
    public class MusicController : MonoBehaviour
    {
        private AudioSource _audioSource;
        private bool _fadeIn;
        private bool _fadeOut;
        private float _volume = 0;
        private float _duration;
    
        void Start()
        {
            _audioSource = gameObject.GetComponent<AudioSource>();
        }
    
        void Update()
        {
            if (_fadeIn)
            {
                if (_volume < 1)
                {
                    _volume = Math.Min(_volume + (Time.deltaTime / _duration), 1);
                    _audioSource.volume = _volume;
                }
                else
                {
                    _fadeIn = false;
                }
            
            } else if (_fadeOut)
            {
                if (_volume > 0)
                {
                    _volume = Math.Max(_volume - (Time.deltaTime  / _duration), 0);
                    _audioSource.volume = _volume;
                }
                else
                {
                    _fadeOut = false;
                }
            }
        }

        public void FadeIn(float duration)
        {
            Debug.Log(_audioSource);
            _duration = duration;
            _fadeIn = true;
        }
    
        public void FadeOut(float duration)
        {
            _duration = duration;
            _fadeOut = true;
        }
    }
}
