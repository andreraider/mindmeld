using System;
using models;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class NewGroupMenuController : MonoBehaviour
    {
        private NetworkController _networkController;
        
        // Input controls
        private TMP_InputField _groupInputField;
        private TMP_InputField _durationInputField;
        private Button _nextButton;

        private void Start()
        {
            GameObject networkControllerGameObject = GameObject.Find("NetworkController");
            _networkController = networkControllerGameObject.GetComponent<NetworkController>();
            
            GameObject groupNameInputFieldGameObject = gameObject.transform.Find("GroupNameInputField").gameObject;
            _groupInputField = groupNameInputFieldGameObject.GetComponent<TMP_InputField>();
            
            GameObject durationInputFieldGameObject = gameObject.transform.Find("DurationInputField").gameObject;
            _durationInputField = durationInputFieldGameObject.GetComponent<TMP_InputField>();

            GameObject nextButtonGameObject = gameObject.transform.Find("NextButton").gameObject;
            _nextButton = nextButtonGameObject.GetComponent<Button>();

            Validate();
        }

        public void OnNextButtonClicked()
        {
            string groupName = _groupInputField.text;
            int duration = Int32.Parse(_durationInputField.text);

            _networkController.CreateGroup(new MeditationGroup(groupName, false, duration));
        }

        public void Clear()
        {
            _groupInputField.text = "";
            _durationInputField.text = "20";
        }
        
        public void Validate()
        {
            string groupName = _groupInputField.text;
            string duration = _durationInputField.text;
            _nextButton.interactable = !string.IsNullOrEmpty(groupName) && !string.IsNullOrEmpty(duration);
        }
    }
}
