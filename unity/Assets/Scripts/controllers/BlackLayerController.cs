using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class BlackLayerController : MonoBehaviour
    {
        private GameObject _panelGameObject;
        private GameObject _timeOverTextGameObject;
        private Image _panelImage;
        private TMP_Text _timeOverText;
        private bool _fadeIn;
        private bool _fadeOut;
        private float _opacity = 1;
        private float _duration;
    
        void Start()
        {
            _panelGameObject = gameObject.transform.Find("Panel").gameObject;
            _panelImage = _panelGameObject.GetComponent<Image>();
            _timeOverTextGameObject = gameObject.transform.Find("TimeOverText").gameObject;
            _timeOverText = _timeOverTextGameObject.GetComponent<TMP_Text>();
        }
    
        void Update()
        {
            if (_fadeIn)
            {
                if (_opacity < 1)
                {
                    _opacity = Math.Min(_opacity + (Time.deltaTime / _duration), 1);
                    _panelImage.color = Color.Lerp(Color.clear, Color.black, _opacity);
                    _timeOverText.color = Color.Lerp(Color.clear, Color.white, _opacity);
                }
                else
                {
                    _fadeIn = false;
                }
            
            } else if (_fadeOut)
            {
                if (_opacity > 0)
                {
                    _opacity = Math.Max(_opacity - (Time.deltaTime  / _duration), 0);
                    _panelImage.color = Color.Lerp(Color.clear, Color.black, _opacity);
                    _timeOverText.color = Color.Lerp(Color.clear, Color.white, _opacity);

                }
                else
                {
                    gameObject.SetActive(false);
                    _fadeOut = false;
                }
            }
        }

        public void FadeIn(float duration, bool timeOver = false)
        {
            _timeOverTextGameObject.SetActive(timeOver);
            _duration = duration;
            gameObject.SetActive(true);
            _fadeIn = true;
        }
    
        public void FadeOut(float duration)
        {
            _duration = duration;
            _fadeOut = true;
        }
    }
}
