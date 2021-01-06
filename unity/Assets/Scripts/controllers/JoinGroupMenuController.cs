using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class JoinGroupMenuController : MonoBehaviour
    {
        private NetworkController _networkController;
        
        // Input controls
        private TMP_InputField _groupInputField;
        private Button _nextButton;
        
        // Input values
        private string _groupName;

        private void Start()
        {
            GameObject networkControllerGameObject = GameObject.Find("NetworkController");
            _networkController = networkControllerGameObject.GetComponent<NetworkController>();
            
            GameObject groupNameInputFieldGameObject = gameObject.transform.Find("GroupNameInputField").gameObject;
            _groupInputField = groupNameInputFieldGameObject.GetComponent<TMP_InputField>();
            
            GameObject nextButtonGameObject = gameObject.transform.Find("NextButton").gameObject;
            _nextButton = nextButtonGameObject.GetComponent<Button>();

            ValidateForm();
        }

        public void OnGroupNameValueChanged(string value)
        {
            _groupName = value;
            ValidateForm();
        }

        public void OnNextButtonClicked()
        {
            _networkController.FindGroup(_groupName);
        }

        public void Clear()
        {
            _groupInputField.text = "";
        }
        
        private void ValidateForm()
        {
            _nextButton.interactable = !string.IsNullOrEmpty(_groupName);
        }
    }
}
