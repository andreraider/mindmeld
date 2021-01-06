using TMPro;
using UnityEngine;

namespace controllers
{
    public class ErrorMessageController : MonoBehaviour
    {
        private TMP_Text _text;
        
        public void StartOnInactive()
        {
            GameObject textGameObject = gameObject.transform.Find("Text").gameObject;
            _text = textGameObject.GetComponent<TMP_Text>();
        }

        public void SetMessage(string message)
        {
            _text.text = message;
        }
    }
}
