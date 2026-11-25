package com.google.gson.reflect;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

/**
 * Minimal TypeToken replacement — captures the generic type argument of an
 * anonymous subclass, e.g. new TypeToken<List<Integer>>(){}.getType().
 */
public class TypeToken<T> {
    private final Type type;

    protected TypeToken() {
        Type superclass = getClass().getGenericSuperclass();
        if (superclass instanceof ParameterizedType) {
            this.type = ((ParameterizedType) superclass).getActualTypeArguments()[0];
        } else {
            this.type = superclass;
        }
    }

    public Type getType() {
        return type;
    }
}
