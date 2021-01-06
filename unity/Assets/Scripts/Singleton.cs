using System.Collections.Generic;
using UnityEngine;

public class Singleton : MonoBehaviour
{
    private static readonly Dictionary<string, GameObject> Instances = new Dictionary<string, GameObject>();

    public string type;
    
    void Awake()
    {
        // Make object singleton for given type
        if (Instances.ContainsKey(type))
        {
            Destroy(gameObject);
        }
        else
        {
            Instances.Add(type, gameObject);
        }

        // Keep object when switching to another scene
        DontDestroyOnLoad(gameObject);
    }
}
