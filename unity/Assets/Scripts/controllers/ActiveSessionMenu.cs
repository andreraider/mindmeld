using UnityEngine;

namespace controllers
{
    public class ActiveSessionMenu : MonoBehaviour
    {
        private NetworkController _networkController;

        private void Start()
        {
            GameObject networkControllerGameObject = GameObject.Find("NetworkController");
            _networkController = networkControllerGameObject.GetComponent<NetworkController>();
        }

        public void LeaveGroup()
        {
            _networkController.LeaveGroup();
        }
    }
}
